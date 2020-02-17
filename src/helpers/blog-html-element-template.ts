class BlogHtmlElementTemplate {
  public static createTagLinkBlock(blogLink: string, title: string): string {
    return `      <li><a href="${blogLink}">${title}</a></li>
              <div id="appendNewLinkPoint"></div>`
  }

  public static createHomepageLinkBlock(
    blogLink: string,
    title: string
  ): string {
    return `
      <li>
        <a href="${blogLink}">${title}</a>
      </li>
    `
  }
}

export default BlogHtmlElementTemplate
