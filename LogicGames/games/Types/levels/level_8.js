levels[7] = {
  helperText: "Well done! Time for more higher order functions.\n\n"
  + "Reduce is a function that applies a function between elements of a list.\n"
  + "For example, Reduce (+) [1,2,3,4] == 10.\n\n"
  + "Your goal is to produce the string \"Potato\".",
  goalOutput: {
    params: [],
    output: "String",
    func: "\"Potato\""
  },
  startingBlocks: [
    {
      params: [],
      output: "[String]",
      func: "[\"P\",\"o\",\"t\",\"a\",\"t\",\"o\"]"
    },
    {
      params: ["String", "String"],
      output: "String",
      func: "concat"
    },
    {
      params: ["(String -> String -> String)", "[String]"],
      output: "String",
      func: "reduce"
    }
  ]
}
