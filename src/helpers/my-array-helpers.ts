import moment from 'moment'

class MyArrayHelpers {
  public static removeSpaceandEmptyElementInArrayString(
    arr: Array<string>
  ): Array<string> {
    arr = arr.filter(value => {
      return /\w+/.test(value)
    })

    return arr
  }

  public static compareDateInSortByDateAsc(firstDate: Date, secondDate: Date) {
    if (moment(firstDate).isAfter(moment(secondDate))) {
      return -1
    } else if (moment(firstDate).isBefore(moment(secondDate))) {
      return 1
    } else {
      return 0
    }
  }
}

export default MyArrayHelpers
