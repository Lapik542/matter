document.addEventListener('DOMContentLoaded', function() {
    var Matter = window.Matter,
        Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Bodies = Matter.Bodies,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse;
  
    var engine = Engine.create(),
        world = engine.world;
  
    engine.world.gravity.y = 4;
  
    var containerWidth = window.innerWidth * 1.01;
    var containerHeight = 439;
  
    if (window.innerWidth < 1919 && window.innerWidth > 1511) {
        containerHeight = 400;
    }
  
    if (window.innerWidth < 1511 && window.innerWidth > 833) {
        containerHeight = 400;
    }
  
    if (window.innerWidth < 833) {
        containerHeight = 450;
    }
  
    var matterContainer = document.querySelector('.matter');
    var matterRect = matterContainer.getBoundingClientRect();
  
    var render = Render.create({
        element: matterContainer,
        engine: engine,
        canvas: document.getElementById('matterCanvas'),
        options: {
            width: containerWidth,
            height: containerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });
  
    Render.run(render);
  
    var runner = Runner.create();
    Runner.run(runner, engine);
  
    var draggableBodies = [];
  
    var draggableElements = Array.from(document.querySelectorAll('.draggable'));
  
    function setElementToAbsolute(el, randomX, randomY) {
        el.style.position = 'absolute';
        el.style.left = `${randomX}px`;
        el.style.top = `${randomY}px`;
        el.style.userSelect = 'none';
        el.style.cursor = 'pointer';
    }
  
    draggableElements.forEach(function(el, index) {
        var rect = el.getBoundingClientRect();
        var randomX = Math.random() * (containerWidth - rect.width);
        var randomY = Math.random() * (containerHeight - rect.height);
  
        var body = Bodies.rectangle(
            randomX,
            randomY,
            rect.width,
            rect.height,
            {
                isStatic: false,
                render: {
                    fillStyle: el.classList.contains('background-1') ? '#000' : 'transparent',
                    strokeStyle: '#000',
                    lineWidth: 1
                }
            }
        );
  
        setElementToAbsolute(el, randomX, randomY);
  
        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('touchstart', onTouchStart, { passive: false });
  
        function onMouseDown(event) {
            event.preventDefault();
            startDrag(event.clientX, event.clientY);
        }
  
        function onTouchStart(event) {
            event.preventDefault();
            var touch = event.touches[0];
            startDrag(touch.clientX, touch.clientY);
        }
  
        function startDrag(clientX, clientY) {
            el.isDragging = true;
            body.isStatic = true;
            el.dragStartX = clientX;
            el.dragStartY = clientY;
            el.bodyStartX = body.position.x;
            el.bodyStartY = body.position.y;
            el.style.zIndex = 1000;
  
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
        }
  
        function onMouseMove(event) {
            if (el.isDragging) {
                moveElement(event.clientX, event.clientY);
            }
        }
  
        function onTouchMove(event) {
            if (el.isDragging) {
                var touch = event.touches[0];
                moveElement(touch.clientX, touch.clientY);
            }
        }
  
        function moveElement(clientX, clientY) {
            var deltaX = clientX - el.dragStartX;
            var deltaY = clientY - el.dragStartY;
            var newX = el.bodyStartX + deltaX;
            var newY = el.bodyStartY + deltaY;
  
            newX = Math.max(Math.min(newX, containerWidth - rect.width), 0);
            newY = Math.max(Math.min(newY, containerHeight - rect.height), 0);
  
            Body.setPosition(body, { x: newX, y: newY });
        }
  
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchend', onTouchEnd);
  
        function onMouseUp(event) {
            if (el.isDragging) {
                endDrag();
            }
        }
  
        function onTouchEnd(event) {
            if (el.isDragging) {
                endDrag();
            }
        }
  
        function endDrag() {
            el.style.position = 'absolute';
            el.style.left = `${body.position.x - el.offsetWidth / 2}px`;
            el.style.top = `${body.position.y - el.offsetHeight / 2}px`;
            el.style.zIndex = '';
            el.isDragging = false;
  
            body.isStatic = false;
  
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('touchmove', onTouchMove);
        }
  
        Composite.add(world, body);
  
        draggableBodies.push({ body: body, element: el });
    });
  
    var ground = Bodies.rectangle(containerWidth / 2, containerHeight + 30, containerWidth, 60, { isStatic: true });
    var leftWall = Bodies.rectangle(-30, containerHeight / 2, 60, containerHeight, { isStatic: true });
    var rightWall = Bodies.rectangle(containerWidth + 30, containerHeight / 2, 60, containerHeight, { isStatic: true });
    var ceiling = Bodies.rectangle(containerWidth / 2, -30, containerWidth, 60, { isStatic: true });
  
    Composite.add(world, [ground, leftWall, rightWall, ceiling]);
  
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });
  
    Composite.add(world, mouseConstraint);
  
    render.mouse = mouse;
  
    Matter.Events.on(engine, 'afterUpdate', function() {
        draggableBodies.forEach(function(item) {
            var body = item.body;
            var el = item.element;
  
            el.style.left = `${body.position.x - el.offsetWidth / 2}px`;
            el.style.top = `${body.position.y - el.offsetHeight / 2}px`;
            el.style.transform = `rotate(${body.angle}rad)`;
        });
    });
  
    Render.lookAt(render, Composite.allBodies(world));
  
    function endDrag(event) {
        draggableBodies.forEach(function(item) {
            var body = item.body;
            var el = item.element;
  
            if (el.isDragging) {
                setTimeout(function() {
                    el.style.left = `${body.position.x - el.offsetWidth / 2}px`;
                    el.style.top = `${body.position.y - el.offsetHeight / 2}px`;
                    el.style.transform = `rotate(${body.angle}rad)`;
                    el.isDragging = false;
                }, 0);
            }
        });
    }
  
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
  });
  