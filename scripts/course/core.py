"""Original learning tasks aligned to the teacher's grade-5 curriculum."""
from fractions import Fraction as F
from math import gcd

def f(value):
    q=F(value)
    return str(q.numerator) if q.denominator==1 else f'{q.numerator}/{q.denominator}'

def dec(value,places=3):
    return f'{float(F(value)):.{places}f}'.rstrip('0').rstrip('.').replace('.',',')

def number(prompt,answer,note,hint=None,model=None,check=None):
    return dict(type='number',prompt=prompt,answer=f(answer),note=note,hint=hint or note,success=f'Верно! Ответ: {f(answer)}.',model=model,check=check)

def choice(prompt,answer,options,note,hint=None,model=None):
    options=list(dict.fromkeys(map(str,options)))
    assert str(answer) in options
    return dict(type='choice',prompt=prompt,answer=str(answer),options=options,note=note,hint=hint or note,success=f'Верно: {answer}.',model=model)

def multi(prompt,answer,options,note):
    return dict(type='multi',prompt=prompt,answer=list(map(str,answer)),options=list(map(str,options)),note=note,hint=note,success='Все нужные карточки выбраны.')

def order(prompt,values,note,key=None):
    result=sorted(values,key=key or (lambda x:F(str(x).replace(',','.'))))
    return dict(type='order',prompt=prompt,answer=list(map(str,result)),options=list(map(str,values)),note=note,hint=note,success='Порядок верный: '+' → '.join(map(str,result))+'.')

def shade(n,d,prompt=None):
    return dict(type='shade',prompt=prompt or f'Закрась {n}/{d} полоски.',answer=n,total=d,note=f'Целое разделено на {d} равных частей. Нажимай на части.',hint=f'Знаменатель {d} — все части. Числитель {n} — сколько частей нужно закрасить.',success=f'Закрашено {n} из {d} равных частей: {n}/{d}.')

def ray(n,d=1,max_index=None):
    return dict(type='ray',prompt=f'Отметь точку с координатой {f(F(n,d))}.',answer=n,unit=d,max=max_index or max(d*2,n+1),note=f'От 0 до 1 — {d} равных промежутков.',hint='Считай промежутки от нуля. До 1 должен получиться целый единичный отрезок.',success=f'Координата отмеченной точки — {f(F(n,d))}.')

def expr(prompt,a,b,op,note,model=None):
    a,b=F(a),F(b)
    answer={'+':lambda:a+b,'−':lambda:a-b,'×':lambda:a*b,'÷':lambda:a/b}[op]()
    return number(prompt,answer,note,model=model,check={'op':op,'args':[f(a),f(b)]})

def fraction(n,d):return {'type':'fraction','n':n,'d':d}
def equation(text):return {'type':'expression','text':text}
def bars(labels,values):return {'type':'bars','labels':labels,'values':values}

def package(mission,notes,example,paper,tasks):
    assert len(tasks)==6
    return {'mission':mission,'notes':notes,'example':example,'paper':paper,'tasks':tasks}
