require(["jquery", "velocity"], ($) => {
    /*
        В html разметке начальные и конечные точки для анимации помечены с помощью дата-атрибутов
        data-animate-container и data-animate-pos, data-animate-container в значении содержит имя
        анимируемого элемента, data-animate-pos - является ли контейнер начальной/конечной точкой
        анимации элемента. В коде ниже Всё собирается в объект animatedElementsPositions, где ключ - 
        имя анимируемого элемента, значение - еще один объект с ключами start и end, значения - ссылка 
        на html элемент, который соответствует начальной/конечной точке анимации.

        Вся анимация для скролла схематически работает так : есть 2 html элемента, которые с помощью дата-атрибутов
        устанавливаются начальными/конечными точками для положения анимируемого элемента при скролле. Все последующие методы осуществляют
        рассчёт координат по X и Y осям между этими двумя точками и в зависимости от положения при скролле меняют стили
        через style атрибут.

        Правила анимации, которые задаются ч-з html атрибут data-animation-rules ч-з пробел :

        * translate - элемент будет передвигаться при скролле сверху-вниз
        * translate-reverse - элемент будет передвигаться при скролле снизу-вверх 
        * scale - элемент по ходу передвижения будет увеличиваться в р-ре
        * scale-reverse - элемент по ходу передвижения будет уменьшаться в р-ре
        * fade-out - при достижении конечной конечной точки анимации при дальнейшем скролле прозрачность элемента будет
                     уменьшаться и элемент будет смещаться к правому краю
        * fade-in- при достижении конечной конечной точки анимации при дальнейшем скролле прозврачность элемента будет
                     увеличиваться
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

    const animatedElements = document.querySelectorAll(
        "[data-animate-component]"
    );
    Array.from(animatedElements).forEach((element) => {
        const { animateComponent, animationRules } = element.dataset;
        /* достаём из дата-атрибута правила анимации для текущего элемента, сплитим 
           в массив, дабы не плодить кучу дата-атрибутов, но сохранить возможность в
           последующем добавлять/изменять кол-во/вид анимаций на странице с помощью
           дата-атрибутов в html без редактирования js кода
        */
        let animationRulesArray;

        if (animationRules) {
            animationRulesArray = animationRules.split(" ");
        }
        // ================================================================

        /*
            Объявление переменных, которые в последующем будут содержать
            данные о местоположении начальной/конечной точки по осям X и Y,
            общую "длину анимации" в пикселях по обеим осям ( нужно для вычисления 
            процентного значения "завершенности" анимации ), и разницу в координатах между
            текущим положением и общей "длиной" анимации. Также задаётся treshold ( расстояние по оси y
            сверху начальной точки анимируемого элемента + указанное расстояние в пикселях,
            с этой точки запустится анимация ).
        */
        let startPositionY;
        let endPositionY;
        let startPositionX;
        let endPositionX;
        let animationLenghtY;
        let animationLenghtX;
        let deltaY;
        let deltaX;
        const animationTreshold = 140;

        /*
            функция для обработки скролла, запускается также 1 раз при инциализации
        */
        function calculateStylesOnScroll() {
            /* Рассчёт начальных/конечных координат анимируемого элемента, а так же общего
               расстояния анимации элемента по осям 
            */
            startPositionY =
                animatedElementsPositions[animateComponent][
                    "start"
                ].getBoundingClientRect().y;
            endPositionY =
                animatedElementsPositions[animateComponent][
                    "end"
                ].getBoundingClientRect().y;
            startPositionX =
                animatedElementsPositions[animateComponent][
                    "start"
                ].getBoundingClientRect().x;
            endPositionX =
                animatedElementsPositions[animateComponent][
                    "end"
                ].getBoundingClientRect().x;

            animationLenghtY = Math.abs(startPositionY - endPositionY);
            animationLenghtX = Math.abs(startPositionX - endPositionX);

            // константы для определения того, началась ли анимация, и завершилась ли анимация ( это нужно в дальнейшем для
            // понимания того, в какой момент начинать/заканчивать производить вычисления в изменениях стилей анимируемого элемента)
            const isStartAnimationPointReached =
                startPositionY < animationTreshold;

            const isAnimationFinished = endPositionY - animationTreshold < 0;

            // =======================================================================================
            if (isStartAnimationPointReached) {
                deltaY =
                    endPositionY > animationTreshold
                        ? animationLenghtY - endPositionY + animationTreshold
                        : animationLenghtY + endPositionY;

                /*
                    (animationLenghtX * deltaY) / animationLenghtY - в итоге даёт процентную величину "завершенности" 
                    анимации на основании этой величины можно рассчитывать deltaX для процентного смещения
                    анимируемого элемента по оси X пропорционально пройденному растоянию по оси Y
                    от начала до конца анимации. В итоге получается движение элемента по диагонали
                */
                deltaX = (animationLenghtX * deltaY) / animationLenghtY;

                if (
                    animationRulesArray.includes("translate") &&
                    endPositionY > animationTreshold
                ) {
                    let transformRule = `translate(${deltaX}px , ${deltaY}px)`;

                    /* см. коммент выше, только в отношении скейла ( в конечной точке анимации
                        итоговый скейл получается 1.5 ( 150% );
                    */
                    if (animationRulesArray.includes("scale")) {
                        transformRule += `scale(${
                            1 + deltaY / animationLenghtY / 2
                        })`;
                    }

                    element.style.transform = transformRule;
                    element.style.opacity = 1;
                    element.style.marginRight = 0;
                }
                if (
                    animationRulesArray.includes("translate-reverse") &&
                    endPositionY < 0
                ) {
                    let transformRule = `translate(${
                        isNaN(deltaX) ? 0 : deltaX
                    }px , ${deltaY}px)`;

                    if (animationRulesArray.includes("scale")) {
                        transformRule += `scale(${
                            1 + deltaY / animationLenghtY / 2
                        })`;
                    }
                    element.style.transform = transformRule;
                    element.style.opacity = 1;
                    element.style.marginRight = 0;
                }
                if (animationRulesArray.includes("opacity")) {
                    // см. коммент выше, только в отношении прозачности
                    let opacity = deltaY / animationLenghtY;
                    element.style.opacity = opacity;
                }
            } else {
                resetStylesToInitValues(element);
            }
            if (isAnimationFinished) {
                if (animationRulesArray.includes("fade-out")) {
                    let opacity = Math.abs(endPositionY / animationTreshold);
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
                    setExtremeAnimatedElPosition(element, animationRulesArray);
                }
            }
        }
        calculateStylesOnScroll();

        window.addEventListener("scroll", function () {
            calculateStylesOnScroll();
        });
    });

    /*
        смещение элемента к "стандартному" положению.
        Добавлено из-за того, что прослушиватель скролла в крайних положениях
        выдаёт неточные значения
    */
    function resetStylesToInitValues(element) {
        element.style = "";
    }

    /*
        смещение элемента к "крайнему" положению анимации.
        Добавлено из-за того, что прослушиватель скролла в крайних положениях
        выдаёт неточные значения
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
        }
    }

    /*
        Функция, которая вернёт true, если в переданном массиве есть нужная строка (добавил для того, чтобы 
        запихнуть проверку на наличие правила анимации в switch-case и не плодить кучу if-else)
    */
    function checkIsArrayIncludesRule(rulesArray, term) {
        return !!rulesArray.includes(term);
    }
});
