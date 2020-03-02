import momentTimezone from 'moment-timezone'
import constants from '../common/constants'

class BlogHtmlElementTemplate {
  public static createTagBlogLink(
    blogLink: string,
    title: string,
    date: Date,
    blogOfTagTags: string,
    minRead: number
  ): string {
    return `
                <div class="blog-of-tag">
                  <h3>
                    <a href="${blogLink}"
                      >${title}</a
                    >
                  </h3>
                  <div>
                    <span class="blog-date"
                      >&#x1F550; ${momentTimezone(date)
                        .tz(constants.TIME_ZONE_LOCATION)
                        .format('dddd, MMMM Do YYYY')}
                    </span>
                    <span class="min-read">
                      &#128214; ${minRead} phút đọc
                    </span>
                    <span class="blog-of-tag-tags">
                      ${blogOfTagTags}
                    </span>
                  </div>
                </div>
    `
  }

  public static createBlogOfTagTags(
    allTagsOfBlog: Array<string>,
    tagUrl: string
  ): string {
    let result = ''
    allTagsOfBlog.forEach(tag => {
      result += `<span><a href="${tagUrl}/${tag}.html" class="tag">${tag}</a></span>`
    })

    return result
  }

  public static createBlogOfHomepageTags(
    allTagsOfBlog: Array<string>,
    tagUrl: string
  ): string {
    let result = ''
    allTagsOfBlog.forEach(tag => {
      result += `<span><a href="${tagUrl}/${tag}.html" class="tag">${tag}</a></span>`
    })

    return result
  }

  public static createHomePageBlogLink(
    blogLink: string,
    title: string,
    date: Date,
    minRead: number,
    blogHomepageTags: string
  ): string {
    return `
            <div class="index-post">
              <h3>
                <a href="${blogLink}"
                  >${title}</a
                >
              </h3>
              <div>
                <span class="blog-date">&#x1F550; ${momentTimezone(date)
                  .tz(constants.TIME_ZONE_LOCATION)
                  .format('dddd, MMMM Do YYYY')} </span>
                <span class="min-read">
                  &#128214; ${minRead} phút đọc
                </span>
                <span>
                  ${blogHomepageTags}
                </span>
              </div>
            </div>
    `
  }

  public static createTagsOfBlog(
    tagArray: Array<string>,
    tagUrl: string
  ): string {
    let result = ''
    tagArray.forEach(tag => {
      const tagLinkElement = `
      <li>
        <a class="tag" href="${tagUrl}/${tag}.html">${tag}</a>
      </li>
      `

      result += tagLinkElement
    })

    return result
  }

  public static createOtherTagLink(tagName: string, tagUrl: string): string {
    return `
    <a href="${tagUrl}" class="tag">${tagName}</a>`
  }
}

export default BlogHtmlElementTemplate
