levels[2] = {
  helperText: "Now that you have gotten to grips "
  + "with the basic system, here's another task. \n\nYour goal "
  + "is to create the list [1,2,3,4]. \n\n Good luck!",
  goalOutput: {
    params: [],
    output: "[Int]",
    func: "[1,2,3,4]"
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
      func: "2"
    },
    {
      params: [],
      output: "Int",
      func: "3"
    },
    {
      params: [],
      output: "Int",
      func: "4"
    },
    {
      params: [],
      output: "[Int]",
      func: "[]"
    },
    {
      params: ["Int", "[Int]"],
      output: "[Int]",
      func: "cons"
    },
    {
      params: ["Int", "[Int]"],
      output: "[Int]",
      func: "cons"
    },
    {
      params: ["Int", "[Int]"],
      output: "[Int]",
      func: "cons"
    },
    {
      params: ["Int", "[Int]"],
      output: "[Int]",
      func: "cons"
    }
  ]
}

