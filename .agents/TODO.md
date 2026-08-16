# TODOLIST

## Home Page `/` `home.html`
- [x] Let `errorList` only handle the form Submission
- [x] in `index.css` and `index.js` restyle the errorList so it matches the design of 
- [x] Send a notification to admin everytime a contact has been submitted

## Spaces Page /dashboard/design/project-types/<id>/
- [x] Remove the Gallery/Edit Modal and replace them a dedicate page named `space_details.html`
- [x] Space Details page must allow the admin to modify the space and upload a bulk images
- [x] when uploading gallery images for a space all fields are optional except the image 
- [x] Each gallery Image Must contain a modal so the admin can edit the tags/description
- [ ] Remove the gallery Images fields from the Create Modal


## Space Details Page /dashboard/design/spaces/<id>/
- [ ] Inlcude a Gallery Preview when in a popup when images uploaded 
- [ ] Align the buttons of `.sd-gallery-item` to right

## Invitation Model
**Context**
Invitation feature will allow the admin to send a custom and unqiue invitation link to a user to signup

- [x] Create an invitation Model in `dashboard.models`, with following fields
    - `UUID`
    - `email`
    - `name` optional 
    - `phone_number` optional
- [x] Create the invitation views in `dashboard/views/invitations.py`
- [x] Use a Modal for Invitation Creation
- [x] Use Cards for the Invitation List
- [x] Send an email template to the provided email with a link to set his password
- [x] When A User Signup using the invitation Link set his Role To `client`
- [x] The E-mail template must inlcude the FR/EN Text 
- [x] Use a `atomic` to Create the invvitation and send the email


## Dashboard Models

- [x] Create 30 Item for the Models of 
    - Project Types
    - Packages
    - Projects
    - Contact
    - Videos
    - Inquieries
    - Leads
    - Portfolio
    - Spaces

**PS:**
- if you need images for the object creaton, use areal images from google search/pixbay/unsplash
- Never Duplicate the Image/Video

- [ ] all dashboard List Views Must Be Ordered by the last created items