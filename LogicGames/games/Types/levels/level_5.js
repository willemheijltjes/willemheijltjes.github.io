levels[4] = {
  helperText: "You're a pro! Since you're learning fast, here's another concept.\n\n"
  + "Try dragging the parameters of a function over its output."
  + "This will allow you to create outputs that are functions themselves (this will become useful!).\n\n"
  + "The apply function takes an input of a function, and applies its other argument to it.\n"
  + "For example apply (+3) 2 == 5\n\n"
  + "Your goal is to make the number 27, good luck.",
  goalOutput: {
    params: [],
    output: "Int",
    func: "27"
  },
  startingBlocks: [
    {
      params: [],
      output: "Int",
      func: "3"
    },
    {
      params: ["Int"],
      output: "Int",
      func: "+24"
    },
    {
      params: ["(Int -> Int)", "Int"],
      output: "Int",
      func: "apply"
    }
  ]
}
