'use strict';
const CDN='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
let ready;
const DRIVER = String.raw`
import ast, contextlib, io, json
class Output(io.StringIO):
    def write(self, value):
        if self.tell() + len(value) > 8000:
            raise RuntimeError("Слишком много строк вывода.")
        return super().write(value)

allowed_nodes = set("""Module Expr Assign AugAssign AnnAssign Name Load Store Constant BinOp UnaryOp Add Sub Mult Div FloorDiv Mod Pow UAdd USub Not Call keyword JoinedStr FormattedValue Attribute Compare Eq NotEq Lt LtE Gt GtE IfExp BoolOp And Or If Pass Tuple List Dict Subscript Slice""".split())
safe = {"int": int, "float": float, "str": str, "bool": bool, "type": type, "round": round, "len": len, "abs": abs, "range": range, "min": min, "max": max, "sum": sum, "print": print}
def checked_pow(base, exponent):
    if not isinstance(base, (int, float)) or not isinstance(exponent, (int, float)) or abs(base) > 10**9 or abs(exponent) > 20:
        raise ValueError("Для степени возьми небольшое основание и показатель от −20 до 20.")
    return base ** exponent

def checked_mult(a, b):
    if isinstance(a, (str, list, tuple)) and isinstance(b, int) and len(a)*b > 10000:
        raise ValueError("Повтор слишком велик для этой задачи.")
    if isinstance(b, (str, list, tuple)) and isinstance(a, int) and len(b)*a > 10000:
        raise ValueError("Повтор слишком велик для этой задачи.")
    if isinstance(a, int) and isinstance(b, int) and a.bit_length() + b.bit_length() > 1000:
        raise ValueError("Слишком большое число для этой лаборатории.")
    return a * b

class SafeArithmetic(ast.NodeTransformer):
    def visit_BinOp(self, node):
        self.generic_visit(node)
        if isinstance(node.op, (ast.Pow, ast.Mult)):
            name = "_p" if isinstance(node.op, ast.Pow) else "_m"
            return ast.copy_location(ast.Call(func=ast.Name(id=name, ctx=ast.Load()), args=[node.left,node.right], keywords=[]),node)
        return node

def exercise(payload):
    data = json.loads(payload)
    code = data["code"]
    try:
        tree = ast.parse(code, filename="урок.py")
        nodes = list(ast.walk(tree))
        names = {type(n).__name__ for n in nodes}
        if len(nodes) > 430:
            return json.dumps({"error": "Сократи программу: этот редактор рассчитан на небольшие задачи."})
        for node in nodes:
            kind = type(node).__name__
            if kind not in allowed_nodes:
                return json.dumps({"error": f"Строка {getattr(node, 'lineno', '?')}: конструкция {kind} не входит в учебный набор."})
            if isinstance(node, ast.AugAssign) and isinstance(node.op, (ast.Pow, ast.Mult)):
                return json.dumps({"error":"Запиши умножение или степень обычным присваиванием, например x = x * 2."})
            if isinstance(node, ast.Name) and node.id.startswith("_"):
                return json.dumps({"error":"В этой лаборатории имена переменных должны начинаться с буквы."})
            if isinstance(node, ast.Attribute) and not (
                node.attr == "__name__" and isinstance(node.value, ast.Call) and
                isinstance(node.value.func, ast.Name) and node.value.func.id == "type"):
                return json.dumps({"error":"В этой лаборатории из атрибутов доступно только type(значение).__name__."})
        calls = {n.func.id for n in nodes if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)}
        compiled = compile(ast.fix_missing_locations(SafeArithmetic().visit(tree)), "урок.py", "exec")
    except SyntaxError as exc:
        return json.dumps({"error": f"Строка {exc.lineno}: ошибка синтаксиса. {exc.msg}"})
    runs = []
    for test in data["cases"]:
        supplied = iter(test.get("inputs", []))
        def read_line(prompt=""):
            try:
                return next(supplied)
            except StopIteration:
                raise EOFError("Добавь недостающие входные данные: одно значение на строку.") from None
        buf = Output()
        env = {"__builtins__": {**safe, "input": read_line}, "_p": checked_pow, "_m": checked_mult}
        err = ""
        try:
            with contextlib.redirect_stdout(buf):
                exec(compiled, env, env)
        except Exception as exc:
            err = f"{type(exc).__name__}: {exc}"
        store_types = {k:type(v).__name__ for k,v in env.items() if not k.startswith("_")}
        runs.append({"output": buf.getvalue(), "error": err, "types": store_types})
    markers = {"types": sorted(names), "calls": sorted(calls),
               "reassign": len([n.id for n in nodes if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)]) >
                            len({n.id for n in nodes if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)})}
    return json.dumps({"runs": runs, "markers": markers})
`;
async function boot(){
  importScripts(CDN+'pyodide.js');
  const py=await self.loadPyodide({indexURL:CDN,stdout:()=>{},stderr:()=>{}});
  py.runPython(DRIVER);
  return py;
}
self.onmessage=async ({data})=>{
  const id=data.id;
  try{
    if(!ready){ready=boot();}
    const py=await ready;
    self.postMessage({id,state:'ready'});
    py.globals.set('lesson_payload',JSON.stringify({code:data.code,cases:data.cases}));
    const response=JSON.parse(py.runPython('exercise(lesson_payload)'));
    self.postMessage({id,response});
  } catch (err){
    ready=undefined;
    self.postMessage({id,unavailable:'Не удалось загрузить Python. Проверь подключение к интернету и попробуй ещё раз. Остальные материалы урока доступны без Python.'});
  }
};
