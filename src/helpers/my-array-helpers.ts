class MyArrayHelpers {
  public static removeSpaceandEmptyElementInArrayString(
    arr: Array<string>
  ): Array<string> {
    arr = arr.filter(value => {
      return /\w+/.test(value)
    })

    return arr
  }
}

export default MyArrayHelpers
