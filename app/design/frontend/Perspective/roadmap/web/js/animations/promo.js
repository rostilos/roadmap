require(["jquery", "velocity"], ($) => {
    // ПРОШУ ПРОЩЕНИЯ, ЕСЛИ КТО-ТО ЭТО БУДЕТ РЕВЬЮВИТЬ, Я ПРАВДА НЕ ХОТЕЛ.....
    /*
        В html разметке начальные и конечные точки для анимации помечены с помощью дата-атрибутов
        data-animate-container и data-animate-pos, data-animate-container в значении содержит имя
        анимируемого элемента, data-animate-pos - является ли контейнер начальной/конечной точкой
        анимации элемента. В коде ниже Всё собирается в объект animatedElementsPositions, где ключ - 
        имя анимируемого элемента, значение - еще один объект с ключами start и end, значения - ссылка 
        на html элемент, который соответствует начальной/конечной точке анимации.

        Вся анимация для скролла схематически работает так : есть 2 html элемента, которые с помощью дата-атрибутов
        устанавливаются начальными/конечными точками для положения элемента при скролле. Все последующие методы осуществляют
        рассчёт координат по X и Y осям между этими двумя точками и в зависимости от положения при скролле меняют стили
        через style атрибут.
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
    Array.from(animatedElements).forEach((element, index) => {
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
            общую "длину" "анимации" в пикселях по обеим осям ( нужно для вычисления 
            процентного значения "завершенности" анимации ), и разницу в координатах между
            текущим положением и общей "длиной" анимации.
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
        
        function calculateStylesOnScroll() {
            /* Рассчёт начальных/конечных координат анимируемого элемента, а так же общего
               расстояния анимации элемента по осям + задаётся treshold ( расстояние по оси y
               сверху начальной точки анимируемого элемента + указанное расстояние в пикселях,
               с этой точки запустится анимация ).
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
            // =======================================================================================
            if (
                startPositionY < animationTreshold &&
                endPositionY > animationTreshold
            ) {
                deltaY = animationLenghtY - endPositionY + animationTreshold;

                /*
                    (animationLenghtX * deltaY) / animationLenghtY - в итоге даёт процентную величину "завершенности" 
                    анимации на основании этой величины можно рассчитывать deltaX для процентного смещения
                    анимируемого элемента по оси X проорционально пройденному растоянию по оси Y
                    от начала до конца анимации. В итоге получается движение элемента по диагонали
                */
                deltaX = (animationLenghtX * deltaY) / animationLenghtY;

                if (animationRulesArray.includes("translate")) {
                    let transformRule = `translate(${deltaX}px , ${deltaY}px)`;

                    /* см. коммент выше, только в отношении скейла ( в конечной точке анимации
                        итоговый скейл получается 1.25 ( 150% );
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
                if (animationRulesArray.includes("opacity")) {
                    // см. коммент выше, только в отношении прозачности
                    let opacity = deltaY / animationLenghtY;
                    element.style.opacity = opacity;
                }
            } else if (startPositionY < animationTreshold && endPositionY < 0) {
                /* То же, что и условие выше, но немного изменены формулы 
                   для движения снизу-вверх
                */

                deltaY = animationLenghtY + endPositionY;
                deltaX = (animationLenghtX * deltaY) / animationLenghtY;

                if (animationRulesArray.includes("translate-reverse")) {
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
                    let opacity = deltaY / animationLenghtY;
                    element.style.opacity = opacity;
                }
                // =======================================================================================
            } else if (endPositionY > 0 && endPositionY < animationTreshold) {
                if (animationRulesArray.includes("fade-out")) {
                    let opacity = Math.abs(endPositionY / animationTreshold);
                    element.style.marginRight = `${
                        (animationTreshold - endPositionY) * -5
                    }px`;
                    element.style.opacity = opacity;
                }
                if (animationRulesArray.includes("fade-in")) {
                    let opacity =
                        (animationTreshold - Math.abs(endPositionY)) /
                        animationTreshold;
                    let right =
                        (Math.abs(endPositionY) / animationTreshold) * 100;

                    element.style.opacity = opacity < 0.15 ? 0 : opacity;
                    element.style.transform = `translateX(-${right}%)`;
                }
            } else {
                /*
                    смещение элемента к "стандартному" положению.
                    Добавлено из-за того, что прослушиватель скролла в крайних положениях
                    выдаёт неточные значения
                */
                element.style.transform = `translate(0, 0)`;
            }
        }

        calculateStylesOnScroll();

        /*
            В целях улучшения производительности прослушиватели событий
            для элементов, которые находятся вне видимой области 
            удаляются.
        */
        // function onEntry(entry) {
        //     let element = entry[0];
        //     if (element.isIntersecting) {
        //         window.addEventListener("scroll", function () {
        //             calculateStylesOnScroll();
        //         });
        //     } else {
        //         window.removeEventListener("scroll", function () {
        //             calculateStylesOnScroll();
        //         });
        //     }
        // }
        
        // let options = { threshold: 0 };
        // let observer = new IntersectionObserver(onEntry, options);

        // observer.observe(element);
        window.addEventListener("scroll", function () {
            calculateStylesOnScroll();
        });
    });
});
