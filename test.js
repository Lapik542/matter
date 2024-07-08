document.addEventListener('DOMContentLoaded', function() {
    var Matter = window.Matter,
        Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

    var engine = Engine.create();
    var world = engine.world;

    var render = Render.create({
        element: document.body,
        engine: engine,
        canvas: document.getElementById('matterCanvas'),
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    Render.run(render);

    var runner = Runner.create();
    Runner.run(runner, engine);

    var box = Bodies.rectangle(200, 200, 80, 80, {
        render: {
            fillStyle: 'blue'
        }
    });

    var ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 30, window.innerWidth, 60, { isStatic: true });

    Composite.add(world, [box, ground]);

    window.addEventListener('resize', function() {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        Matter.Render.lookAt(render, Composite.allBodies(world));
    });
});
