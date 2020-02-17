import fs from 'fs'
import path from 'path'
import util from 'util'
import FileDirHelpers from './helpers/file-dir-helpers'
import HtmlBlockTemplate from './helpers/blog-html-element-template'

let template = `
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
<li><a href="#">Blog one</a></li>
<li><a href="#">Blog two</a></li>
<li><a href="#">Blog three</a></li>
<div id="appendNewLinkPoint"></div>
</ul>
</div>
<div class="other-tag">
{{otherTag}}
</div>
</div>
</body>

</html>
`

const appendContent = HtmlBlockTemplate.createTagLinkBlock(
  'https://google.com',
  'Huy deep try'
)

const replaceRegex = new RegExp('<div id="appendNewLinkPoint"></div>', 'g')

template = template.replace(replaceRegex, appendContent)

console.log('===========> template ', template)

