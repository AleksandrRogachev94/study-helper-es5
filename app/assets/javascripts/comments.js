'use strict'

//TODOTODOTODOTODO
// Refactor AJAX!!!!!

//------------------------------------------------------------------------
// Comment Class

function Comment(attributes) {
  this.id = attributes.id
  this.content = attributes.content
  this.created_at = attributes.created_at
  this.author = attributes.author
}

// Instance methods

Comment.prototype.render = function() {
  const li = Comment.template(this)
  $("#comments").prepend(li)
}

Comment.prototype.replaceCommentWithForm = function($li) {
  const form = Comment.updateTemplate(this)
  $li.replaceWith(form)
}

Comment.prototype.replaceFormWithComment = function($form) {
  const li = Comment.template(this)
  $form.replaceWith(li)
}

Comment.prototype.destroy = function() {
  $("li#comment_" + this.id).remove()
}

// Class methods

Comment.ready = function() {
  Comment.commentsToUpdate = [] // Array for all comments opened to update

  let source = $("#comment-template").html()
  Comment.template = Handlebars.compile(source)

  source = $("#update-comment-template").html()
  Comment.updateTemplate = Handlebars.compile(source)

  Comment.attachListeners()
}

Comment.attachListeners = function() {
  $("#new_comment").on("submit", Comment.formSubmit)
  $("#comments").on("submit", ".delete-comment", Comment.destroy)

  $("#comments").on("click", ".update-comment", Comment.addUpdateForm)
  $("#comments").on("submit", ".form-update-comment", Comment.update)
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Create comment

Comment.formSubmit = function(ev) {
  ev.preventDefault()
  const $form = $(this)

  const params = $form.serialize()
  const action = $form.attr("action")

  $.ajax({
    url: action,
    type: "POST",
    data: params,
    dataType: "json"
  })
  .done(Comment.successCreate)
  .fail(Comment.failCreate)
}

Comment.successCreate = function(json) {
  $.rails.enableFormElements($("#new_comment"))

  const comment = new Comment(json)

  $("#new_comment textarea").val("")// Empty input
  $("#create-comment-error").text("") // Empty error div
  comment.render() // Adding to the page
}

Comment.failCreate = function(xhr) {
  $.rails.enableFormElements($("#new_comment"))

  let error
  switch(xhr.readyState) {
    case 0:
      error = "Network Error"
      break
    case 4:
      error = $.parseJSON(xhr.responseText).errors.join(", ")
      break
    default:
      error = "Error occured"
  }

  $("#create-comment-error").text(error)
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Delete comment

Comment.destroy = function(ev) {
  ev.preventDefault()

  const $form = $(this)
  if(!Comment.confirmDestroy($form)) return;

  const params = $form.serialize()
  const action = $form.attr("action")

  $.ajax({
    url: action,
    type: "DELETE",
    data: params,
    dataType: "json"
  })
  .done(Comment.successDestroy)
  .fail(Comment.failDestroy.bind($form))
}

Comment.confirmDestroy = function($form) {
  if(!confirm("Are you sure?")) {
    setTimeout(function() { $.rails.enableFormElements($form) }, 100) // Preventing disabling of a button
    return false;
  }
  return true
}

Comment.successDestroy = function(json) {
  const comment = new Comment(json)
  comment.destroy()
}

Comment.failDestroy = function(xhr) {
  let error
  switch(xhr.readyState) {
    case 0:
      error = "Network Error"
      break
    default:
      error = "Error occured"
  }
  // 'this' binded to form
  this.parent().next().text(error)
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Update comment

Comment.addUpdateForm = function(ev) {
  ev.preventDefault()
  const id = $(this).data("id")

  const comment = Comment.from_li(id)
  Comment.commentsToUpdate.push(comment) // Add to array of comments opened to update.

  comment.replaceCommentWithForm($(this).parent().parent())
}

Comment.from_li = function(id) {
  let $li = $("li#comment_" + id)
  if($li.length <= 0) return new Comment({});

  const json = {
    id: id,
    content: $li.find(".content").text(),
    created_at: $li.find(".created_at").text(),
    author: {
      appearance: $li.find(".appearance").text()
    }
  }

  return new Comment(json)
}

Comment.update = function(ev) {
  ev.preventDefault()

  const $form = $(this)

  const params = $form.serialize()
  const action = $form.attr("action")

  $.ajax({
    url: action,
    type: "PATCH",
    data: params,
    dataType: "json"
  })
  .done(Comment.successUpdate.bind($form))
  .fail(Comment.failUpdate.bind($form))
}

Comment.successUpdate = function(json) {
  const comment = new Comment(json)

  // 'this' binded to form
  comment.replaceFormWithComment($(this))
}

Comment.failUpdate = function(xhr) {
  let error;

  switch(xhr.readyState) {
    case 0:
      error = "Network Error"
      break
    case 4:
      const json = $.parseJSON(xhr.responseText)
      error = json.errors.join(", ")
      break
    default:
      error = "Error occured"
  }

  // 'this' binded to form
  const id = this.parent().data("id")
  const comment = Comment.removeFromArray(id)
  comment.replaceFormWithComment(this.parent())
  $("#comment_" + id + " .comment-error").text(error)
}

Comment.removeFromArray = function(id) {

  let array = Comment.commentsToUpdate
  let i, l = array.length
  for(i = 0; i < l; i++) {

    if(array[i].id === id) {
      Comment.commentsToUpdate = [...array.slice(0, i), ...array.slice(i + 1)]
      return array[i]
    }
  }
}


//------------------------------------------------------------------------
// Documents Ready

$(document).ready(function() {
  Comment.ready()
})
