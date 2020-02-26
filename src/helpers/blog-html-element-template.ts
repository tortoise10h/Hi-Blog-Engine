class BlogHtmlElementTemplate {
  public static createTagBlogLinkWithAppendPoint(
    blogLink: string,
    title: string
  ): string {
    return `
    ${BlogHtmlElementTemplate.createTagBlogLink(blogLink, title)}
    <div id="appendNewLinkPoint"></div>`
  }

  public static createTagBlogLink(blogLink: string, title: string): string {
    return `
            <li>
              <a href="${blogLink}">${title}</a>
            </li>`
  }

  public static createHomePageBlogLink(
    blogLink: string,
    title: string
  ): string {
    return `
    <li>
    <a href="${blogLink}">${title}</a>
    </li>`
  }

  public static createOtherTagLink(tagName: string, tagUrl: string): string {
    return `
    <a href="${tagUrl}">${tagName}</a>`
  }
}

export default BlogHtmlElementTemplate
