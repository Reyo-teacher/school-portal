from .core import *
from . import naturals,divisibility,fractions

def make(family,v,n):
    seed=v+n%7
    if family=='quarter1':
        specs=[(naturals,'compare',1),(naturals,'equations',3),(divisibility,'rules_3_9',2),(divisibility,'gcd_lcm_calc',4),(fractions,'mixed',3),(fractions,'fraction_ray',5)]
        notes=['Сначала определи, что требуется: сравнить, найти число или выполнить построение.','Для НОД ищут общие делители, для НОК — общие кратные.','У дроби знаменатель показывает число равных частей единицы.']
        example=['Проверь себя: 3/2 на луче','Это 1 1/2. Точка находится посередине между 1 и 2.']
    elif family=='fraction_basics':
        specs=[(fractions,'fraction_intro',0),(fractions,'reduce',0),(fractions,'new_denominator',2),(fractions,'proper',3),(fractions,'mixed',3),(fractions,'fraction_ray',5)]
        notes=['Числитель — число взятых долей, знаменатель — число равных долей в целом.','При изменении записи дроби её значение сохраняется только при одинаковом множителе или делителе обеих частей.']
        example=['Разные записи одного числа','6/4 = 3/2 = 1 1/2. На луче это одна точка.']
    else:
        specs=[(fractions,'compare_fractions',3),(fractions,'add_different',1),(fractions,'mixed_operations',2),(fractions,'multiply',3),(fractions,'reciprocal',2),(fractions,'divide',5)]
        notes=['Перед сложением и вычитанием сделай знаменатели одинаковыми.','При умножении перемножай числители и знаменатели; при делении замени делитель обратным числом.','После вычисления сократи дробь и проверь, разумен ли ответ.']
        example=['2/3 ÷ 4/5','2/3 × 5/4 = 10/12 = 5/6. Проверка: 5/6 × 4/5 = 2/3.']
    tasks=[module.make(name,seed,n)['tasks'][i] for module,name,i in specs]
    return package('Собери карту знаний',notes,example,'Выбери два трудных задания. Реши похожие примеры со своими числами и объясни правило. Исправь ошибку, если она обнаружилась.',tasks)
