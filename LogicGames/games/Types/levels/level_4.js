levels[3] = {
   helperText: "Now that you are comfortable, we will add a new concept.\n\n"
   + "Currying is the act of reducing the number of parameters of a function, "
   + "combining them in tuples of varying sizes.\n\n"
   + "You can perform currying by dragging parameters over eachother.\n\n"
   + "Try it out! Try and the goal is to make the Integer 14.",
  goalOutput: {
    params: [],
    output: "Int",
    func: "14"
  },
  startingBlocks: [
    {
      params: [],
      output: "Int",
      func: "7"
    },
    {
      params: ["Int"],
      output: "(Int, Int)",
      func: "\\x -> (x,x)"
    },
    {
      params: ["Int", "Int"],
      output: "Int",
      func: "+"
    }
  ]
}
