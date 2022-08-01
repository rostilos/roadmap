define([], () => {
    return (config) => {
        /*
        Вся анимация для скролла схематически работает так : есть 2 html элемента, которые с помощью дата-атрибутов
        устанавливаются начальными/конечными точками для положения анимируемого элемента при скролле. Все последующие методы осуществляют
        рассчёт координат по X и Y осям между этими двумя точками и в зависимости от положения при скролле меняют стили
        через style атрибут.

        Правила анимации, которые задаются ч-з html атрибут data-animation-rules ( ч-з пробел ) :

        * translate - элемент будет передвигаться при скролле сверху-вниз
        * scale - элемент по ходу передвижения будет увеличиваться в р-ре
        * scale-reverse - элемент по ходу передвижения будет уменьшаться в р-ре
        * fade-out - при достижении конечной конечной точки анимации при дальнейшем скролле прозрачность элемента будет
                     уменьшаться и элемент будет смещаться к правому краю
        * fade-in- при достижении конечной конечной точки анимации при дальнейшем скролле прозврачность элемента будет
                     увеличиваться

        Константы, которые задаются ч-з конфиг :
        * animationTreshold - ( расстояние по оси y
                              сверху начальной точки анимируемого элемента + указанное 
                              расстояние в пикселях, с этой точки запустится анимация ).
        * scaleRatio - коеффициент скейла    
        * scaleRatioReverse - коеффициент, указывающий от какого значения скейл будет уменьшаться до 1-го при анимации
                              уменьшения элемента     
         */

        const animationTreshold = config.animationTreshold ?? 140;
        const scaleRatio = config.scaleRatio ?? 1.5;
        const scaleRationReverse = config.scaleRationReverse ?? 2;

        /*  
            Достаём из html разметки все элементы, которые являются конечными/начальными точками анимации
            для определённого элемента анимации. В дальнейшем перебираем полученную
            коллекцию элементов, преобразованную в массив.
            С помощью деструктуризации вытаскиваем из датасета заранее заданные значения дата-атрибутов 
            animateContainer, animatePos, и выставляем их в кач-ве ключей объекта animatedElementsPositions, значение
            по ключу - ссылка на html элемент, который выступает в кач-ве конечной/начальной точки анимации.
        */
        const animatedElementsContainers = document.querySelectorAll(
            "[data-animate-container]"
        );
        let animatedElementsPositions = {};

        Array.from(animatedElementsContainers).forEach((element) => {
            const { animateContainer, animatePos } = element.dataset;

            if (!animatedElementsPositions.hasOwnProperty(animateContainer)) {
                animatedElementsPositions[animateContainer] = {};
            }

            animatedElementsPositions[animateContainer][animatePos] = element;
        });
        //=======================================================================================================

        /*  
            Достаём из html разметки все элементы, для которых будет задаваться анимация при скролле
            (все элементы с дата-атрибутом [data-animate-component]), в дальнейшем перебираем полученную
            коллекцию элементов, преобразованную в массив, на элементы 
            вешаем обработчик скролла с ф-цией для рассчёта стилей анимируемого элемента в кач-ве коллбека.
        */
        const animatedElements = document.querySelectorAll(
            "[data-animate-component]"
        );
        Array.from(animatedElements).forEach((element) => {
            /*
                Объявление переменных, которые в последующем будут содержать
                данные о и разнице в координатах между
                текущим положением и общей "длиной" анимации.
            */

            let deltaY;
            let deltaX;

            /*
                Правила анимации для текущего елемента
            */
            let animationRulesArray = getAnimationRulesFromDataset(element);

            /*
                Функция для обработки скролла, запускается также 1 раз при инциализации
            */
            function calculateStylesOnScroll() {
                /*
                    Переменные с данными о местоположении начальной/конечной точки по осям X и Y,
                    общей "длине анимации" в пикселях по обеим осям ( нужно для вычисления 
                    процентного значения "завершенности" анимации )
                */
                const {
                    startPositionY,
                    endPositionY,
                    animationLenghtX,
                    animationLenghtY,
                } = calculatePosValues(element);

                /* 
                    Константы для определения того, началась ли анимация, и завершилась ли анимация ( это нужно в дальнейшем для
                    понимания того, в какой момент начинать/заканчивать производить вычисления в изменениях стилей анимируемого элемента)
                */
                const isStartAnimationPointReached =
                    startPositionY < animationTreshold;

                const isAnimationFinished =
                    endPositionY - animationTreshold < 0;

                // =======================================================================================
                if (isAnimationFinished) {
                    if (animationRulesArray.includes("fade-out")) {
                        let opacity = Math.abs(
                            endPositionY / animationTreshold
                        );
                        element.style.marginRight = `${
                            (animationTreshold - endPositionY) * -5
                        }px`;
                        element.style.opacity = opacity;
                    } else if (
                        animationRulesArray.includes("fade-in") &&
                        endPositionY > 0
                    ) {
                        let opacity =
                            (animationTreshold - Math.abs(endPositionY)) /
                            animationTreshold;
                        let right =
                            (Math.abs(endPositionY) / animationTreshold) * 100;

                        element.style.opacity = opacity < 0.15 ? 0 : opacity;
                        element.style.transform = `translateX(-${right}%)`;
                    } else {
                        setExtremeAnimatedElPosition(
                            element,
                            animationRulesArray
                        );
                    }
                    return;
                }
                if (isStartAnimationPointReached) {
                    deltaY =
                        endPositionY > animationTreshold
                            ? animationLenghtY -
                              endPositionY +
                              animationTreshold
                            : Math.min(0, animationLenghtY + endPositionY);

                    /*
                        Коеффициент, на который множится дельта по  Y оси ( добавлен для того, чтобы в дальнейшем
                        множить на него translateY значение, чтобы анимируемый элемент шел немного впереди скролла, а не линейно)
                    */
                    const deltaYRatio = 1.5;
                    const multipliedDeltaY = Math.min(
                        animationLenghtY,
                        deltaY * deltaYRatio
                    );

                    /*
                        (animationLenghtX * deltaY) / animationLenghtY - в итоге даёт процентную величину "завершенности" 
                        анимации на основании этой величины можно рассчитывать deltaX для процентного смещения
                        анимируемого элемента по оси X пропорционально пройденному растоянию по оси Y
                        от начала до конца анимации. В итоге получается движение элемента по диагонали
                    */
                    deltaX =
                        (animationLenghtX * multipliedDeltaY) /
                        animationLenghtY;

                    if (animationRulesArray.includes("translate")) {
                        let transformRule;

                        if (endPositionY > animationTreshold) {
                            transformRule = `translate(${deltaX}px , ${multipliedDeltaY}px)`;
                        } else if (endPositionY < 0) {
                            transformRule = `translate(${
                                isNaN(deltaX) ? 0 : deltaX
                            }px , ${multipliedDeltaY}px)`;
                        }

                        /* 
                            см. коммент выше, только в отношении скейла ( в конечной точке анимации
                            итоговый скейл получается равным константе scaleRatio ;
                        */
                        if (animationRulesArray.includes("scale")) {
                            transformRule += `scale(${
                                1 +
                                (deltaY / animationLenghtY) * (scaleRatio - 1)
                            })`;
                        }

                        /* 
                            см. коммент выше, только в отношении скейла к значению 1 из значения, заданного в
                            константе scaleRatioReverse
                        */
                        if (animationRulesArray.includes("scale-reverse")) {
                            transformRule += `scale(${
                                scaleRationReverse - deltaY / animationLenghtY
                            })`;
                        }

                        element.style.opacity = 1;
                        element.style.marginRight = 0;

                        element.style.transform = transformRule;
                    }
                    if (animationRulesArray.includes("opacity")) {
                        // см. коммент выше, только в отношении прозачности
                        let opacity = deltaY / animationLenghtY;
                        element.style.opacity = opacity;
                    }
                } else {
                    resetStylesToInitValues(element);
                }
            }

            calculateStylesOnScroll();

            window.addEventListener("scroll", function () {
                calculateStylesOnScroll();
            });
        });

        //=======================================================================================================

        /* Достаём из дата-атрибута правила анимации для текущего элемента, сплитим 
            в массив, дабы не плодить кучу дата-атрибутов, но сохранить возможность в
            последующем добавлять/изменять кол-во/вид анимаций на странице с помощью
            дата-атрибутов в html без редактирования js кода
        */
        function getAnimationRulesFromDataset(element) {
            const { animationRules } = element.dataset;

            if (animationRules) {
                animationRulesArray = animationRules.split(" ");
            }
            return animationRules && animationRules.split(" ");
        }
        //=======================================================================================================

        /*
            Функция для инициализации данных о текущих координатах анимируемого элемента в момент скролла
        */

        function calculatePosValues(element) {
            const { animateComponent } = element.dataset;
            /* 
               Рассчёт начальных/конечных координат анимируемого элемента, а так же общего
               расстояния анимации элемента по осям 
            */
            const startPositionY =
                animatedElementsPositions[animateComponent][
                    "start"
                ].getBoundingClientRect().y;
            const endPositionY =
                animatedElementsPositions[animateComponent][
                    "end"
                ].getBoundingClientRect().y;
            const startPositionX =
                animatedElementsPositions[animateComponent][
                    "start"
                ].getBoundingClientRect().x;
            const endPositionX =
                animatedElementsPositions[animateComponent][
                    "end"
                ].getBoundingClientRect().x;

            const animationLenghtY = Math.abs(startPositionY - endPositionY);
            const animationLenghtX = Math.abs(startPositionX - endPositionX);

            return {
                startPositionY,
                endPositionY,
                startPositionX,
                endPositionX,
                animationLenghtX,
                animationLenghtY,
            };
        }
        //=======================================================================================================

        /*
            Смещение элемента к "стандартному" положению.
            Добавлено из-за того, что прослушиватель скролла при быстром скролле 
            в крайних положениях выдаёт неточные значения
        */
        function resetStylesToInitValues(element) {
            element.style = "";
        }
        //=======================================================================================================

        /*
            Смещение элемента к "крайнему" положению анимации.
            Добавлено из-за того, что прослушиватель скролла при быстром скролле 
            в крайних положениях выдаёт неточные значения
        */
        function setExtremeAnimatedElPosition(element, stylesArray) {
            switch (true) {
                case checkIsArrayIncludesRule(stylesArray, "fade-in"):
                    element.style.opacity = 1;
                    element.style.transform = `translateX(0)`;
                    break;
                case checkIsArrayIncludesRule(stylesArray, "fade-out"):
                    element.style.opacity = 0;
                    break;
                case checkIsArrayIncludesRule(stylesArray, "opacity"):
                    element.style.opacity = 1;
                    break;
            }
        }
        //=======================================================================================================

        /*
            Функция, которая вернёт true, если в переданном массиве есть нужная строка (добавил для того, чтобы 
            запихнуть проверку на наличие правила анимации в switch-case и не плодить кучу if-else)
        */
        function checkIsArrayIncludesRule(rulesArray, term) {
            return !!rulesArray.includes(term);
        }
        //=======================================================================================================
    };
});
