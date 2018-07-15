import { Position } from "../Position";
import { Power4, TweenMax, Power2 } from "gsap";

interface Point {
    position: Position;
    time: number;
    drift: Position;
    age: number;
    direction: Position;
}

export class Follower
{
    private removeDelay = 400;

    private stage:HTMLElement;
    private line:SVGPathElement;
    private points: Point[];
    private color: string;
    
    constructor(stage:HTMLElement, color:string)
    {
        this.points = [];
        this.stage = stage;
        this.color = color;
   
        this.line = document.createElementNS("http://www.w3.org/2000/svg", 'path')
        this.line.style.fill = this.color;

        this.stage.appendChild(this.line);

        window.requestAnimationFrame(() => this.trim())
    }
    
    private getDrift():number
    {
        return (Math.random() - 0.5) * 3;
    }

    public add(position:Position)
    {
        let direction = {x: 0, y:0};
        if(this.points[0])
        {
            direction.x = (position.x - this.points[0].position.x) * 0.25;
            direction.y = (position.y - this.points[0].position.y) * 0.25;
        }
        let point = {
            position: position,
            time: new Date().getTime(),
            drift: {x: this.getDrift() + (direction.x / 2), y: this.getDrift() + (direction.y/ 2)},
            age: 0,
            direction: direction
        }

        let shapeChance = Math.random();
        let chance = 0.1;
        if(shapeChance < chance) this.makeCircle(point);
        else if(shapeChance < chance * 2) this.makeSquare(point);
        else if(shapeChance < chance * 3) this.makeTriangle(point);

        this.points.unshift(point);
    }

    private createLine(points:Point[]):string
    {
        
        let path:string[] = [points.length ? 'M' : '']

        if(points.length > 0) 
        {
            let forward = true;
            let i = 0;

            while(i >= 0)
            {
                let point = points[i];
                let offsetX = point.direction.x * ((i - points.length) / points.length) * 0.6
                let offsetY = point.direction.y * ((i - points.length) / points.length) * 0.6
                let x = point.position.x + (forward ? offsetY : -offsetY);
                let y = point.position.y + (forward ? offsetX : -offsetX);
                point.age += 0.2;
                path.push(String(x + (point.drift.x) * point.age))
                path.push(String(y + (point.drift.y) * point.age))

                i += forward ? 1 : -1;
                if(i == points.length)
                {
                    i--;
                    forward = false
                }
            }    
        }
        
        let pathString = path.join(' ');
        return pathString;
    }

    private trim()
    {
        if(this.points.length > 0) 
        {
            let last = this.points[this.points.length - 1];
            let now = new Date().getTime();
            if(last.time < now - this.removeDelay) this.points.pop();
        }
        this.line.setAttribute('d', this.createLine(this.points))
        
        window.requestAnimationFrame(() => this.trim())
    }

    private makeCircle(point:Point)
    {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.setAttribute('r', String((Math.abs(point.direction.x) +  Math.abs(point.direction.y)) * 1));
            circle.style.fill = this.color;
            circle.setAttribute('cx', '0');
            circle.setAttribute('cy', '0');
        
        this.moveShape(circle, point);
    }
    
    private makeSquare(point:Point)
    {
        let size = (Math.abs(point.direction.x) +  Math.abs(point.direction.y)) * 1.5;
        let square = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            square.setAttribute('width', String(size));
            square.setAttribute('height', String(size));
            square.style.fill = this.color;
            
        this.moveShape(square, point);
    }
    
    private makeTriangle(point:Point)
    {
        let size = (Math.abs(point.direction.x) +  Math.abs(point.direction.y)) * 1.5;
        let triangle = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
            triangle.setAttribute('points', `0,0 ${size},${size/2} 0,${size}`);
            triangle.style.fill = this.color;
            
        this.moveShape(triangle, point);
    }

    private moveShape(shape:any, point:Point)
    {
        this.stage.appendChild(shape);
        let driftX = point.position.x + (point.direction.x * (Math.random() * 20)) + point.drift.x * (Math.random() * 10);
        let driftY = point.position.y + (point.direction.y * (Math.random() * 20)) + point.drift.y * (Math.random() * 10);
        TweenMax.fromTo(shape, 0.5 + Math.random(), {x: point.position.x, y: point.position.y}, { scale: 0, x: driftX , y: driftY, ease: Power4.easeOut, rotation: Math.random() * 360, onComplete: () => {this.stage.removeChild(shape)}})
    }
}