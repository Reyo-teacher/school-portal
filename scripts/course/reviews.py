from .core import *
from . import naturals,divisibility,fractions,decimal_lessons,fraction_words,sets_percent,geometry_data

def make(family,v,n):
    seed=v+n%7
    if family in ['quarter3','decimal_review','quarter4','final_review']:
        if family in ['quarter3','decimal_review']:
            specs=[(decimal_lessons,'decimal_compare',1),(decimal_lessons,'decimal_add',3),(decimal_lessons,'decimal_multiply',5),(decimal_lessons,'decimal_divide',3),(decimal_lessons,'rounding',2),(sets_percent,'venn_words',5)]
            if family=='decimal_review':specs[-1]=(decimal_lessons,'decimal_sequences',0)
            notes=['Вычисляй с учётом разрядов и положения запятой.','Проверяй действия обратными действиями, а округление — нужным разрядом.','При работе с множествами избегай повторного счёта общих элементов.']
            example=['2,4 ÷ 0,6','24 ÷ 6 = 4; проверка: 4 × 0,6 = 2,4.']
        elif family=='quarter4':
            specs=[(sets_percent,'percent_intro',5),(sets_percent,'percent_words',1),(geometry_data,'angle_calc',0),(geometry_data,'circle_intro',2),(geometry_data,'statistics',1),(geometry_data,'solid_net',4)]
            notes=['Процент — одна сотая. Определи, какое число принято за 100%.','Для построений используй линейку, транспортир или циркуль по условию.','Проверь подписи диаграммы и возможность складывания развёртки.']
            example=['Радиус 4 см','Диаметр равен 8 см: он состоит из двух радиусов.']
        else:
            pools=[[(naturals,'equations',3),(divisibility,'gcd_lcm_words',4),(fractions,'reduce',0),(fractions,'divide',5),(decimal_lessons,'decimal_words',4),(geometry_data,'angle_calc',1)],[(fractions,'compare_fractions',3),(fractions,'mixed_operations',2),(fraction_words,'fraction_part',3),(decimal_lessons,'rounding',2),(sets_percent,'union_build',4),(sets_percent,'percent_words',1)],[(divisibility,'rules_3_9',2),(fractions,'multiply',5),(decimal_lessons,'decimal_sequences',0),(sets_percent,'venn_words',5),(geometry_data,'chart_build',4),(geometry_data,'solid_net',4)],[(naturals,'formulas',5),(fraction_words,'joint_work',4),(decimal_lessons,'decimal_add',5),(sets_percent,'percent_whole',5),(geometry_data,'circle_intro',3),(geometry_data,'cut_fold',5)]]
            specs=pools[(n-167)%4]
            notes=['Прочитай вопрос и выпиши нужные данные.','Выбери правило, вычисли или построй, затем проверь результат.','Если понадобилась подсказка, вернись к этой теме и реши ещё один пример самостоятельно.']
            example=['Что делать, если ответ не подходит?','Проверь действие, единицы, вычисления и смысл результата. Ошибка показывает, какой шаг нужно повторить.']
        return package('Путешествие по изученным темам',notes,example,'Выбери тему, в которой нужна тренировка. Составь свою задачу, реши её, затем проверь другим способом или объясни решение учителю.',[mod.make(name,seed,n)['tasks'][i] for mod,name,i in specs])
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
