var levels = [];
levels[0] = {
  helperText: "Welcome to the first level.\n\n"
  + "The goal is to create the Integer 8.\n\n"
  + " Try clicking together the blocks!",
  goalOutput: {
    params: [],
    output: "Int",
    func: "8"
  },
  startingBlocks: [
    {
      params: [],
      output: "Int",
      func: "2"
    },
    {
      params: [],
      output: "Int",
      func: "6"
    },
    {
      params: ["Int", "Int"],
      output: "Int",
      func: "+"
    }
  ]
}
