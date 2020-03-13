export interface ITemplateContentObject {
  template_sign: string
  content: string
}

class BlogUITemplate {
  public getHomepageTemplate(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <title>Hi's blog</title>
        <link rel="stylesheet" href="./css/style.css" />
        <link rel="stylesheet" href="./css/emoji-dist.css" />
      </head>

      <body>
        <div>
          <div class="author-profile">
            <div class="author-profile-brand">
              <div class="author-profile-logo">
                <a href="./index.html"><img src="./img/engine-img/shiba-with-glasses.jpg"></a>
              </div>
              <div class="author-profile-title">
                <h1>Hi's Blog</h1>
              </div>
            </div>
            <div class="author-profile-credit">By <a href="https://www.facebook.com/profile.php?id=100005766513570">Huy Nguyen</a></div>
            <p class="author-note">Nơi ký gửi tâm tư của bạn chủ blog về mọi thứ ở trên đời, chủ yếu là về code nhưng không chỉ có code</p>
            <div class="author-profile-divider"></div>
            <div style="clear:both">
              <a href="https://github.com/tortoise10h" class="author-profile-contact">
                <div>
                  Github
                </div>
                <div class="author-profile-contact-icon">
                  <img src="./img/icons/github-brands.svg" alt="Github icon">
                </div>
              </a>

              <a href="https://www.facebook.com/profile.php?id=100005766513570" class="author-profile-contact">
                <div>
                  Facebook
                </div>
                <div class="author-profile-contact-icon">
                  <img src="./img/icons/facebook-brands.svg" alt="Facebook icon">
                </div>
              </a>

              <a href="https://www.goodreads.com/review/list/76305879" class="author-profile-contact">
                <div>
                  Sách mình đọc
                </div>
                <div class="author-profile-contact-icon">
                  <img src="./img/icons/book-solid.svg" alt="Facebook icon">
                </div>
              </a>

              <a href="#" class="author-profile-contact">
                <div>
                  Về mình
                </div>
                <div class="author-profile-contact-icon">
                  <img src="./img/icons/info-circle-solid.svg" alt="Facebook icon">
                </div>
              </a>
            </div>
          </div>
          <div class="index-table-content">
            {{indexTableContent}}
          </div>

        </div>
      </body>
    </html>
    `
  }

  public getBlogFileTemplate(): string {
    return `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>{{blogTitle}} | Hi's blog</title>
    <link
      rel="icon"
      type="image/icon"
      href="../img/engine-img/shiba-with-glasses.jpg"
    />
    <link rel="stylesheet" href="../css/style.css" />
    <link rel="stylesheet" href="../css/emoji-dist.css" />
  </head>

  <body>
    <div class="blog-logo">
      <a href="../index.html"
        ><img src="../img/engine-img/shiba-with-glasses.jpg" alt="Blog Logo Image"
      /></a>
    </div>
    <div class="container">
      <div class="blog-header">
        <h1 class="blog-title">{{blogTitle}}</h1>
        <div class="date-and-min-read">
          <p class="blog-date">
            &#x1F550; {{blogDate}}
          </p>
          <p class="min-read" id="readingTime"></p>
        </div>
      </div>
      <div class="main-content" id="mainContent">
        {{blogContent}}
      </div>

      <div class="blog-tags-zone">
        <p class="tag-label">Tags:</p>
        <ul class="blog-tags">
          {{blogTags}}
        </ul>
      </div>
    </div>
    <div class="blog-footer">
      <p>You are free to use this content but please ciate</p>
      <p style="text-align: center">
        Created with
        <strong
          ><a
            href="https://github.com/tortoise10h/Hi-Blog-Engine"
            target="_blank"
            >Hi-blog-engine</a
          ></strong
        >
      </p>
    </div>
  </body>

  <script src="../js/highlight.pack.js"></script>
  <script>
    hljs.initHighlightingOnLoad()
  </script>
  <script>
    window.onload = () => {
      const blogContent = document.getElementById('mainContent').innerText
      const wordsPerMinute = 200 // Average case.
      let minRead
      let numOfWords = blogContent.split(' ').length // Split by words
      if (numOfWords > 0) {
        let value = Math.ceil(numOfWords / wordsPerMinute)
        minRead = value
      }
      document.getElementById(
        'readingTime'
      ).innerHTML = \`Dài &#128195; \${numOfWords} từ ~ &#128214; \${minRead} phút đọc\`
    }
  </script>
</html>
    `
  }

  public getTagFileTemplate(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <title>{{tagName}} | Hi's Blog</title>
        <link rel="stylesheet" href="../../css/style.css" />
        <link rel="stylesheet" href="../../css/emoji-dist.css" />
      </head>

      <body>
        <div class="blog-logo">
          <a href="../../index.html"
            ><img
              src="../../img/engine-img/shiba-with-glasses.jpg"
              alt="Blog Logo Image"
          /></a>
        </div>
        <div class="container">
          <div class="tag-header">
            <h1>{{tagName}}</h1>
          </div>
          <div class="tag-table-content">
            {{tagTableContent}}
          </div>
          <div class="other-tags">
            <p>Other Tags:</p>
            {{otherTags}}
          </div>
        </div>
        <div class="blog-footer">
          <p style="text-align: center">
            Created with
            <strong
              ><a
                href="https://github.com/tortoise10h/Hi-Blog-Engine"
                target="_blank"
                >Hi-blog-engine</a
              ></strong
            >
          </p>
        </div>
      </body>
    </html>
    `
  }

  public addContentsToTemplate(
    template: string,
    contentArrayObject: Array<ITemplateContentObject>
  ): string {
    /** loop through content object array and replace each template_sign in template by equivalent content */
    contentArrayObject.forEach(contentObject => {
      const { template_sign, content } = contentObject
      const regex = new RegExp(`${template_sign}`, 'g')
      template = template.replace(regex, content)
    })

    return template
  }
}

export default new BlogUITemplate()
