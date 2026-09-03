levels[6] = {
  helperText: "With the basic mechanics of the game out of the way,"
  + " we can move onto higher order functions.\n\n"
  + "Map takes a function and applies it to every element in a list.\n\n"
  + "Using map, create the list [3,4,5,6].",
  goalOutput: {
    params: [],
    output: "[Int]",
    func: "[4,5,6,7]"
  },
  startingBlocks: [
    {
      params: [],
      output: "Int",
      func: "3"
    },
    {
      params: ["Int", "Int"],
      output: "Int",
      func: "+"
    },
    {
      params: [],
      output: "[Int]",
      func: "[1,2,3,4]"
    },
    {
      params: ["(Int -> Int)", "[Int]"],
      output: "[Int]",
      func: "map"
    }
  ]
}