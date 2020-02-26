import util from 'util'

class MyCustomHelpers {
  public static logObjectDetail(obj: any, prefixStr?: string): void {
    console.log(`${prefixStr || ''} ${util.inspect(obj, false, null, true)}`)
  }
}

export default MyCustomHelpers
