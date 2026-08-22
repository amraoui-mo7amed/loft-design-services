# TODOLIST


## Home Page /

- [x] add the `z-index:9999` to `.gallerySheet.open`

### The Compose Section `#composer`

- [x] Make the request submitted in the dashboard instead of whatsapp
- [x] Get all the data of forms from the dashboard -especially project categories-
- [x] Submit the two forms to Project and Inquiery Model with a notification for admin
- [x] Use atomic to submit the notification and Model
- [x] The Two Forms Must use sweetAlert For Form Submission Handeling
- [x] The SweetAlertMust Be Styled with the Style of `home.css`
- [x] dont auto-select any space card
- [x] Dont show `.quotePreview` instead of it show a button to send the facture via e-mail using sweetalert 
- [x] fix this erro `index.js:148 Uncaught SyntaxError: missing ) after argument list`
 


### Gallery Page `/#Gallery`
- [x] Allow User To Select Multiple Images
- [x] Allow user to view his selected images
- [x] Allow user to submit the selected Images to admin Dashboard with an atomic 
- [x] Use atomic to submit the notification and Notifications 
- [x] Allow the Admin To Send A Custom invitation Link to User So He Fills His Project Details Alongside the Spaces Selected from the images
- [x] the Invitation Link Must Be Tokenized and Must Be Used Only Once 
- [x] Save the E-mail template in `dashboard/template/email`
- [x] After The Project Is Sbmitted send a notification to admin and use atomic 
- [x] the selected images/spaces are not Submitted
- [x] make the `.galleryDetail.open` z-index: 9999
- [x] fix this error 
`index.js?v=1787353059:148 Uncaught SyntaxError: missing ) after argument list (at index.js?v=1787353059:148:13)
/#gallery:1 Blocked aria-hidden on an element because its descendant retained focus. The focus must not be hidden from assistive technology users. Avoid using aria-hidden on a focused element or its ancestor. Consider using the inert attribute instead, which will also prevent focus. For more details, see the aria-hidden section of the WAI-ARIA specification at https://w3c.github.io/aria/#aria-hidden.
Element with focus: <button.galleryDetailClose#galleryDetailClose>
Ancestor with aria-hidden: <section.galleryDetail#galleryDetail> <section class=​"galleryDetail" id=​"galleryDetail" aria-hidden=​"true">​…​</section>​`
- [x] add a button to view the drawer that containes the selected images 
- [x] fix the icon of the button that views the drawer
- [x] add the `z-index:9999` to `.galleryCartDrawer.open`
- [x] `gallerySpaceBtn` is not working
- [x] when the image submitted, save the images/spaces/User Details to Project Model
- [x] hide all the `.galleryCartActions` buttons except `#gallerySubmitSelection`

## Space Details Page /dashboard/design/spaces/<id>

- [x] Allow the admin to Move the Space to another Project Type 

## Dashboard Projects /dashboard/crm/
- [x] fix the connection failed error of sweetalert when status updated
- [x] fix this error in sweetalert `Request Failed
Could not complete the status update. Please try again.`
- [x] fix this kanban.js?v=1787358588:107 Status update error: TypeError: Cannot read properties of undefined (reading 'classList')
    at kanban.js?v=1787358588:90:34
(anonymous) @ kanban.js?v=1787358588:107
Promise.catch
(anonymous) @ kanban.js?v=1787358588:106
Promise.then
then @ sweetalert2@11:5
(anonymous) @ kanban.js?v=1787358588:40


## Dashboard Project Details /dashboard/crm/<id>/
- [x] Remoive the `#btnAdminSendGalleryLink` and its function
- [x] replace the `.text-warning` with `text-dark`
- [x] change the invite Link behaviour so the user will fill the rest of project details 
- [x] fix the connection failed error of sweetalert when status updated
- [x] update the `badge.bg-light.text-dark.rounded-pill` to `badge.bg-light.text-dark.rounded-pill`
- [x] Fix this error `Uncaught SyntaxError: missing ) after argument list (at index.js?v=1787353059:148:13)`
- [x] the client must not be regsitred
- [x] fix this error in sweetalert `Request Failed
Could not complete the status update. Please try again.`
- [x] fix this kanban.js?v=1787358588:107 Status update error: TypeError: Cannot read properties of undefined (reading 'classList')
    at kanban.js?v=1787358588:90:34
(anonymous) @ kanban.js?v=1787358588:107
Promise.catch
(anonymous) @ kanban.js?v=1787358588:106
Promise.then
then @ sweetalert2@11:5
(anonymous) @ kanban.js?v=1787358588:40

## dashboard 
- [x] remove the Invitations Model and update the ui 
- [x] Remove the Inquieries Model and update the ui