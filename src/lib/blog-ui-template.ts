export interface ITemplateContentObject {
  template_sign: string
  content: string
}

class BlogUITemplate {
  public getHomepageTemplate(): string {
    return `
    <!doctype html>
    <html lang="en">

    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Hi's blog</title>
      <link href="https://fonts.googleapis.com/css?family=open+sans:400,700|space+mono:400,700&display=swap&subset=vietnamese" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" />
    </head>

    <body>
      <div class="container">
        <div class="author-profile"></div>
        <div class="table-content">
          {{tableContent}}
        </div>
        <div class="footer"></div>
      </div>
    </body>

    </html>
    `
  }

  public getTagFileTemplate(): string {
    return `
    <!doctype html>
    <html lang="en">

    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
       <title>{{tagName}} | Hi's Blog</title>
       <link href="https://fonts.googleapis.com/css?family=open+sans:400,700|space+mono:400,700&display=swap&subset=vietnamese" rel="stylesheet">
       <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" />
     </head>

     <body>
       <div class="container">
         <div class="tag-table-content">
           <ul>
            {{tagTableContent}}
           </ul>
         </div>
         <div class="other-tag">
           {{otherTag}}
         </div>
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
