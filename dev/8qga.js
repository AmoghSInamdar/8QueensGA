var files = {0:"a", 1:"b", 2:"c", 3:"d", 4:"e", 5:"f", 6:"g", 7:"h"};  // for printing board files
var Pc = 0.6, Pm = 0.2;  // crossover percentage, mutation probabilities

var numQueens = 8;  // number of queens

var generation, winner;
var popSize = 10;

var MAX_POOR_FIT = numQueens * (numQueens-1);  //  worst possible natural score, n overlap with n-1 each 

class Square {
    constructor(x, y) {
        this.file = x;
        this.rank = y;
    }

    toString() {
        //return this.file.toString() + this.rank.toString()
        return files[this.file] + (this.rank + 1).toString();
    }
}

class Individual {
    constructor() {
        this.stdFit = 0;
        this.ascFit = 0;
        this.gene = []; 
    }

    copyGeneFrom(other) {              //  UGHHHH
        for(var i=0; i<other.gene.length; i++) {
            this.gene[i] = new Square(0, 0);
            this.gene[i].rank = other.gene[i].rank;
            this.gene[i].file = other.gene[i].file;
        }
    }

    toString() {
        var pos = "";
        for(var i in this.gene)
            pos += this.gene[i].toString() + " ";
        return pos; 
    }

    getFitness() {
        this.stdFit = 0;
        for(var i in this.gene) 
            for(var j in this.gene)    // counts self overlaps (8) + each overlap twice
                if(this.overlap(this.gene[i], this.gene[j])) {
                    //console.log("Overlap!", this.gene[i].toString(), this.gene[j].toString());
                    this.stdFit += 1;       
                }
        this.stdFit = (this.stdFit - 8) / 2;    // standardized fitness, number of overlaps (raw fitness)
        this.ascFit = MAX_POOR_FIT - this.stdFit;  // max - std, gives 0 to MAX_POOR_FIT, higher the better
    };    
}

Individual.prototype.overlap = (x, y) => {
    if(x.rank == y.rank || x.file == y.file)    // same rank or file
    return true;
    if(Math.abs(x.rank-y.rank) == Math.abs(x.file-y.file))  // same diagonal
        return true;
    return false;
}

function randGen(n) {     // generate random integer between 0 and n-1
    return Math.floor(Math.random() * n);
}

function randSquare() {
    return new Square(randGen(8), randGen(8));
}

function genZero() {     //  create first generation and evaluate fitness
    generation = [];
    for(var i=0; i<popSize; i++) {
        generation[i] = new Individual();
        for(var j=0; j<numQueens; j++) 
            generation[i].gene[j] = randSquare();
    }

    for(var i in generation) 
        generation[i].getFitness();
}

function fitPropSelection(totalFitness) {
    var p = randGen(totalFitness);     //  have a number between 0 and sum of fitnesses - 1
    //console.log(totalFitness, p);
    fitSum = 0;
    for(var i in generation) {
        fitSum += generation[i].ascFit;     // count pie slices from ascended sorted list
        if(fitSum > p)          // roulette wheel landed on i's slice of pie
            return i;
    }
    return -1;          //  should never be reached!
}

function crossover(x, y) {     //  1 point crossover of genes into xNew, yNew
    var cp = randGen(7);       //  crossover point, less than max length (0-6)
    xNew = new Individual(); yNew = new Individual();
    xNew.copyGeneFrom(x); yNew.copyGeneFrom(y);
    for(var i=0, temp; i<=cp; i++) {   //  swap cp points
        temp = xNew.gene[i];
        xNew.gene[i] = yNew.gene[i];
        yNew.gene[i] = temp;
    }
    return new Array(xNew, yNew);
}

function mutate(x) {    // point mutation
    var xNew = new Individual();
    xNew.copyGeneFrom(x);
    xNew.gene[randGen(8)] = randSquare();
    return xNew;
}

function getNextGen() {
    var nextGen = [];
    var numCross = popSize * Pc;
    var numKeep = popSize - numCross;
    var top = 0;

    generation.sort((x, y) => {      // sort decending based on ascending score
        return y.ascFit - x.ascFit;
    });
    var totalFitness = generation.reduce((total, indiv) => {  // sum of ascending fitness scores
        return total + indiv.ascFit;
    }, 0);

    console.log("Number to Crossover:", numCross, numCross/2);

    nextGen[top] = new Individual;            // 1 ELITISM
    nextGen[top].copyGeneFrom(generation[0]);
    top += 1;

    for(var i=0, j; i<numKeep-1; i++) {    //  keep size*(1-Pc) individuals from previous, -1 for elitism
        j = fitPropSelection(totalFitness);
        console.log("Selected", j, "to keep");
        nextGen[top] = generation[j];
        //nextGen[top] = generation[fitPropSelection(totalFitness)];
        top += 1;
    }

    for(var i=0, x, y, ar; i<Math.floor(numCross/2); i++) {      //  2 individuals per crossover
        x = generation[fitPropSelection(totalFitness)];
        do                    
            y = generation[fitPropSelection(totalFitness)];    //  incest is useless 
        while(y == x);
        console.log("Crossover: Old genes", x.toString(), y.toString());
        ar = crossover(x, y);
        console.log("Crossover: New genes", x.toString(), y.toString());  
        nextGen[top] = ar[0]; top += 1;
        nextGen[top] = ar[1]; top += 1;    
    }
    
    for(var i=0; i<nextGen.length; i++) {
        if(Math.random() < Pm) {
            console.log("Mutation: Old gene", nextGen[i].toString());
            nextGen[i] = mutate(nextGen[i]);
            console.log("Mutation: New gene", nextGen[i].toString());
            
        }
    }  

    for(var i in nextGen) 
        nextGen[i].getFitness();

    totalFitness = nextGen.reduce((total, indiv) => {  // sum of ascending fitness scores
        return total + indiv.ascFit;
    }, 0);
    console.log("Total Fitness:", totalFitness);

    return nextGen;
}

/*************TESTING****************/
genZero();

generation.sort((x, y) => {      // sort decending based on ascending score
    return y.ascFit - x.ascFit;
});

console.log("");
console.log("Worst Possible Fitness/ Best Ascending:", MAX_POOR_FIT);
console.log("Individuals:");
for(var i in generation) {
    console.log(i + ". Positions:", generation[i].toString(), "\tFitness:", 
        generation[i].stdFit, "\tScore:", generation[i].ascFit);
}
console.log("");

for(var j=0; j<10000; j++) {
    generation = getNextGen();

    console.log("Individuals:");
    for(var i in generation) {
        console.log(i + ". Positions:", generation[i].toString(), "\tFitness:", 
            generation[i].stdFit, "\tScore:", generation[i].ascFit);
    }
    console.log("");
}
