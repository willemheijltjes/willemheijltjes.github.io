levels[1] = {
  helperText: "Well done, now here's a new challenge.\n\n"
  + "You will notice you can only click together blocks with the "
  + "same types, this will become important!\n\n"
  + "You are given concat blocks that combine strings\n"
  + "(e.g. concat \"abc\" \"def\" == \"abcdef\").\n\n"
  + "Create \"Hello World!\"",
  goalOutput: {
    params: [],
    output: "String",
    func: "\"Hello World!\""
  },
  startingBlocks: [
    {
      params: [],
      output: "String",
      func: "\"World!\""
    },
    {
      params: [],
      output: "String",
      func: "\" \""
    },
    {
      params: [],
      output: "String",
      func: "\"Hello\""
    },
    {
      params: ["String", "String"],
      output: "String",
      func: "concat"
    },
    {
      params: ["String", "String"],
      output: "String",
      func: "concat"
    }
  ]
}