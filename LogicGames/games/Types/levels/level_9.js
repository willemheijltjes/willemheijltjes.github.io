levels[8] = {
  helperText: "Your next task is to create the number 16. \n\n"
  + "Make sure you use the \\x -> (x,x) block correctly."
  + "\n\n Good luck!",
  goalOutput: {
    params: [],
    output: "Int",
    func: "16"
  },
  startingBlocks: [
    {
      params: [],
      output: "Int",
      func: "2"
    },
    {
      params: ["Int"],
      output: "(Int, Int)",
      func: "\\x -> (x,x)"
    },
    {
      params: ["Int"],
      output: "(Int, Int)",
      func: "\\x -> (x,x)"
    },
    {
      params: ["Int", "Int"],
      output: "Int",
      func: "*"
    },
    {
      params: ["Int", "Int"],
      output: "Int",
      func: "*"
    }
  ]
}
