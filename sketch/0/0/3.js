var s1 = function(s) {
  let w, h;
  let attractor;
  let attractors = [];
  let boxes, eyeImg, boxImg;
  // let occhio1, occhio2, occhio3;
  let eyes = [];

  let p = {
    noAttractors: 3,
    xAttractor: 100, //*
    yAttractor: 100, //*
    sizeAttractor: 200, //*
    isBlack: [true, false],
    coloreBulbo: "#000000",
    colorePupilla: "#00ff00",
    backgroundColor: "#000000",
    sizeMultiplier: 60,
    mM: 0.05,
    nBoxes: 500,
    angle: false
  }

  s.setup = function() {
    let cnv;
    if (fs) cnv = s.createCanvas(w = s.displayWidth, h = s.displayHeight);
    else cnv = s.createCanvas(w = s.windowWidth, h = s.windowHeight);
    cnv.parent("canvas");
    s.noStroke();
    s.pixelDensity(1);
    s.rectMode(CENTER);

    let isB = random(p.isBlack);
    if (isB) {
      p.coloreBulbo = p.colorePupilla;
      p.colorePupilla = p.backgroundColor;
      p.backgroundColor = p.coloreBulbo;
    }

    p.xAttractor = w / 2;
    p.yAttractor = h / 2;
    p.sizeAttractor = h / 8;

    engine = Engine.create();
    engine.world.gravity.scale = 0;

    // create engine attractors
    let allAttractors = [];
    for (let i = 0; i < p.noAttractors; i++)
      allAttractors.push(
        Bodies.circle(w / 3 * i + w / 6, p.yAttractor, p.sizeAttractor, {
          isStatic: true,
          plugin: {
            attractors: [
              function(bodyA, bodyB) {
                let vx = bodyA.position.x - bodyB.position.x;
                let vy = bodyA.position.y - bodyB.position.y;
                let m = Math.sqrt(vx * vx + vy * vy);
                let dx = vx / m;
                let dy = vy / m;
                // let mM = 0.4
                var force = {
                  x: (dx * p.mM) / m,
                  y: (dy * p.mM) / m,
                };
                Body.applyForce(bodyA, bodyA.position, Matter.Vector.neg(force));
                Body.applyForce(bodyB, bodyB.position, force);
              }
            ]
          }
        })
      )
    attractors = Composite.create();
    Composite.add(attractors, allAttractors);
    World.add(engine.world, attractors);

    // create engine particles
    let allBoxes = [];
    for (let i = 0; i < p.nBoxes; i++) {
      allBoxes.push(Bodies.rectangle(s.random(w), s.random(h), s.random(30) + 15, s.random(10) + 5, {
        isStatic: false
      }));
    }
    boxes = Composite.create();
    Composite.add(boxes, allBoxes);
    World.add(engine.world, boxes);

    s.genEyes();

    // let's start the engine
    Runner.run(engine);
  }

  s.draw = function() {
    s.clear();
    s.background(p.backgroundColor);

    if (s.mouseIsPressed) {
      // smoothly move the first attractor body towards the mouse if clicked
      Body.translate(attractors.bodies[0], {
        x: (s.mouseX - attractors.bodies[0].position.x) * 0.25,
        y: (s.mouseY - attractors.bodies[0].position.y) * 0.25
      });
    }

    let isBlinking;
    if (s.frameCount % 120 == 0 && random(1) > .5) isBlinking = true;
    for (let e = 0; e < eyes.length; e++) {
      eyes[e].display();
      if (isBlinking) eyes[e].blinking = true;
    }
  }

  s.genEyes = function() {
    if (eyes.length > 0) eyes = [];
    for (let e = 0; e < p.nBoxes; e++) {
      eyes.push(new Eye(s, e, 0, 0, boxes.bodies[e].mass * p.sizeMultiplier));
    }
    // console.log(units.length);
  }
  class Eye {
    constructor(_s, _id, _x, _y, _size) {
      this.s = _s; // < our p5 instance object
      this.id = _id;
      this.x = _x;
      this.y = _y;
      this.size = _size;
      this.originalVSize = 0;
      this.VSize = 0;
      this.blinking = false;
    }
    display() {
      this.s.push();
      if (this.blinking) this.blink();
      // let volume = Sound.mapSound(10, this.id * 22, 0, 150);
      this.s.translate(boxes.bodies[this.id].position.x, boxes.bodies[this.id].position.y)
      if (p.angle) this.s.rotate(boxes.bodies[this.id].angle)
      this.s.fill(p.colorePupilla);
      this.s.rect(0, 0, this.size, this.size, this.size / 10)
      this.s.fill(p.coloreBulbo);
      this.s.rect(0, 0, this.size - 5, this.size - 5, this.size / 12)
      this.s.fill(p.colorePupilla);
      this.s.rect(0, 0, this.size / 4, this.size / 4, this.size / 20)
      this.s.fill(p.coloreBulbo);
      this.s.rect(0, 0, this.size - 5, this.VSize, this.size / 12) // palpebra
      this.s.pop();
    }
    blink() {
      this.VSize += 4;
      if (this.VSize >= this.size / 2) {
        this.VSize = this.originalVSize;
        this.blinking = false;
      }
    }
  }

  s.keyPressed = function() {
    if (s.keyCode === s.RIGHT_ARROW) {
      for (let i = 0; i < attractors.bodies.length; i++) {
        Body.translate(attractors.bodies[i], {
          x: (s.random(w) - attractors.bodies[i].position.x) * 1,
          y: (s.random(h) - attractors.bodies[i].position.y) * 1
        });
      }
    }
  }

}