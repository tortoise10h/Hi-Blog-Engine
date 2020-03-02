import util from 'util'

class MyCustomHelpers {
  public static logObjectDetail(obj: any, prefixStr?: string): void {
    console.log(`${prefixStr || ''} ${util.inspect(obj, false, null, true)}`)
  }

  public static calculateMinRead(textContent: string): number {
    const wordsPerMinute = 200 // Average case.
    let minRead = 0
    const numOfWords = textContent.split(' ').length // Split by words
    if (numOfWords > 0) {
      minRead = Math.ceil(numOfWords / wordsPerMinute)
    }

    return minRead
  }

  public static parseEmoji(str: string): string {
    return str.replace(/\ \:\b([a-z]+)\b\:/g, " <i class='em em-$1'></i>")
  }
}

export default MyCustomHelpers
