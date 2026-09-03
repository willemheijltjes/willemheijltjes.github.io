levels[12] = {
  helperText: "Welcome to teaching types. \n\n"
  + "The aim of this level is to get used to the"
  + " interface, allowing you to click together "
  + "blocks and form functions. \n\n Click close "
  + "and have a go!",
  goalOutput: {
    params: [],
    output: "Int",
    func: "49"
  },
  startingBlocks: [
    {
      params: [],
      output: "Int",
      func: "9"
    },
    {
      params: [],
      output: "Char",
      func: "'$'"
    },
    {
      params: ["Char"],
      output: "Int",
      func: "toInt"
    },
    {
      params: [],
      output: "Int",
      func: "4"
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
    }
  ]
}
