import Markdownit from 'markdown-it'

export default class MyMarkdownit {
  private static markdownConverter: any

  private constructor() {}

  public static getMarkdownitConverter(): any {
    if (!MyMarkdownit.markdownConverter) {
      MyMarkdownit.markdownConverter = new Markdownit()
    }

    return MyMarkdownit.markdownConverter
  }
}
