window.onload = () => {
  let editor = document.getElementById('editorOfOldBlog')
  const markdownArea = document.getElementById('markdownOfOldBlog')

  const convertTextToMarkdown = () => {
    let markdownText = editor.value
    const htmlContent = converter.render(markdownText)
    markdownArea.innerHTML = htmlContent
  }

  /** Event listener for everytime editor text in editor zone */
  editor.addEventListener('input', convertTextToMarkdown)

  /** Run everytime first enter page */
  convertTextToMarkdown()
}
