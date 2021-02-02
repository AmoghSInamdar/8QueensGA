# Genetic Algorithm for the 8 Queens Puzzle

A Genetic Algorithm to solve the 8 queens chess puzzle.

Implements fitness-proportionate selection, single-point crossovers, point-mutations, and 1-elitism.

A single state consists of the locations of 8 queens as (x,y) coordinates. For simplicity, multiple queens on the same square are allowed (they have a lower fitness anyway).
The fitness function evaluates the number of attacks (overlaps) between queens.

Extensions - Add a tunable parameter for elitism (i.e. how many individuals are guaranteed to move to the next generation), develop a webpage, etc.

For general information see:
  https://en.wikipedia.org/wiki/Genetic_algorithm
  https://en.wikipedia.org/wiki/Eight_queens_puzzle
