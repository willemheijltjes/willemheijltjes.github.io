levels[5] = {
  helperText: "Using what you have learned over the past few levels, "
  + "your task is to create an Integer of 9. \n\n Good luck! ",
  goalOutput: {
    params: [],
    output: "Int",
    func: "9"
  },
  startingBlocks: [
    {
      params: [],
      output: "Int",
      func: "1"
    },
    {
      params: [],
      output: "Int",
      func: "3"
    },
    {
      params: [],
      output: "Int",
      func: "5"
    },
    {
      params: ["Int", "Int"],
      output: "(Int, Int)",
      func: "(,)"
    },
    {
      params: ["Int", "Int"],
      output: "Int",
      func: "+"
    },
    {
      params: ["Int", "Int"],
      output: "Int",
      func: "+"
    },
    {
      params: ["(Int -> Int)", "Int"],
      output: "Int",
      func: "apply"
    }
  ]
}