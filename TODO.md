# TODO: Loft Design - Design Service Platform (Rhinov-like + Marketplace Integration)

Priority Legend
- P0 = Critical MVP
- P1 = Important
- P2 = Nice to have
- P3 = Future

---

# PHASE 0 - ANALYSIS

## P0 Audit Existing System

- [ ] Locate authentication system
- [ ] Locate products module
- [ ] Locate shopping cart
- [ ] Locate admin dashboard
- [ ] Locate notification system
- [ ] Locate file upload service
- [ ] Locate payment module
- [ ] Locate customer account system
- [ ] Document reusable components

Deliverable:
Architecture document

---

# PHASE 1 - DATABASE

## P0 Create Design Service Database

### project_types

- [ ] id
- [ ] name
- [ ] slug
- [ ] icon
- [ ] description
- [ ] active
- [ ] sort_order
- [ ] timestamps

Example

Villa

Apartment

Office

Restaurant

Hotel

Commercial

Clinic

Other

---------------------------------------------------

### floors

- [ ] id
- [ ] project_id
- [ ] name
- [ ] level
- [ ] order

---------------------------------------------------

### spaces

- [ ] id
- [ ] name
- [ ] slug
- [ ] icon
- [ ] category
- [ ] base_price
- [ ] estimated_days
- [ ] active

Example

Living Room

Kitchen

Dining Room

Master Bedroom

Bedroom

Bathroom

Guest Bathroom

Laundry

Balcony

Terrace

Garage

Garden

Pool

Hall

Office

Meeting Room

Reception

Restaurant Hall

Bar

Lobby

etc...

---------------------------------------------------

### project_type_spaces

Maps project types to default spaces.

Example

Villa

↓

Living Room

Kitchen

Garage

Garden

etc.

---------------------------------------------------

### design_packages

Pack table

Fields

id

name

description

price_multiplier

active

Examples

Essential

Premium

Executive

---------------------------------------------------

### design_options

Individual paid options

Fields

id

name

slug

description

price

category

Example

Virtual Tour

Lighting Plan

Furniture Plan

Electrical Plan

Ceiling Plan

Shopping List

3D Animation

etc.

---------------------------------------------------

### style_categories

Modern

Contemporary

Scandinavian

Japandi

Industrial

Rustic

Luxury

Minimalist

Mediterranean

Classic

Neo Classical

Bohemian

Wabi Sabi

Italian

Japanese

etc.

---------------------------------------------------

### inspiration_images

Fields

id

space_id

style_category_id

image

title

active

---------------------------------------------------

### design_requests

Main project table

Fields

uuid

client_id

project_name

project_type

status

budget

total

designer_id

delivery_date

revision_count

package_id

timestamps

---------------------------------------------------

### design_request_floors

---------------------------------------------------

### design_request_spaces

---------------------------------------------------

### design_request_options

---------------------------------------------------

### design_request_inspirations

---------------------------------------------------

### design_request_files

---------------------------------------------------

### design_messages

---------------------------------------------------

### design_revisions

---------------------------------------------------

### design_deliverables

---------------------------------------------------

### design_payments

---------------------------------------------------

### design_notes

Internal notes only

---------------------------------------------------

### design_activity_logs

Timeline

---

# PHASE 2 - ADMIN SETTINGS

## P0 Admin Configuration

Create CRUD

- [ ] Project Types
- [ ] Floors
- [ ] Spaces
- [ ] Packages
- [ ] Design Options
- [ ] Style Categories
- [ ] Inspiration Images
- [ ] Pricing Rules
- [ ] Designers

---

# PHASE 3 - PUBLIC LANDING PAGE

Route

/design-service

Components

Hero

Benefits

How it works

Pricing

Portfolio

FAQ

CTA

Buttons

Start My Project

Request Design Service

Get My Quote

Sections

How It Works

1

Choose Project

↓

Choose Spaces

↓

Choose Styles

↓

Submit

↓

Designer Assigned

↓

Receive Design

---

# PHASE 4 - MULTI STEP WIZARD

## P0 Stepper

Step 1

Project Type

Step 2

Floors

Step 3

Spaces

Step 4

Packages

Step 5

Options

Step 6

Style Inspirations

Step 7

Questionnaire

Step 8

Upload Files

Step 9

Summary

Step 10

Submit

---

# STEP 1

Choose Project

Cards

Villa

Apartment

Office

Commercial

Restaurant

Hotel

Clinic

Custom

---

# STEP 2

Create Floors

Features

Add Floor

Delete Floor

Rename Floor

Duplicate Floor

Reorder Floors

Examples

Ground Floor

First Floor

Second Floor

Basement

Roof

Custom

---

# STEP 3

Spaces

Each floor

↓

Select spaces

Checkbox grid

Living Room

Kitchen

Bedroom

Bathroom

etc

Each card shows

Icon

Name

Price

Estimated Delivery

Live subtotal

Allow custom spaces

---

# STEP 4

Packages

Cards

Essential

Premium

Executive

Comparison table

Included

Price

Delivery

Revision count

Select package

---

# STEP 5

Extra Services

Checkbox list

Virtual Tour

Shopping List

Lighting Plan

Furniture Plan

Ceiling Plan

Floor Plan

Kitchen Details

Wardrobe Details

Bathroom Details

Electrical Plan

Plumbing

3D Animation

Site Assistance

Live price update

---

# STEP 6

Inspirations

For EACH selected room

Display gallery

Living Room

↓

Modern

Images

Scandinavian

Images

Luxury

Images

Industrial

Images

etc

Allow

Multi selection

Favorite

Zoom

Preview

Save selection

---

# STEP 7

Questionnaire

Personal

Name

Surname

Company

Phone

WhatsApp

Email

Country

City

Address

Project

Budget

Timeline

Property Type

New Construction

Renovation

Occupied

Vacant

Questions

Need custom furniture?

Need shopping assistance?

Need contractor?

Need supervision?

Preferred colors

Preferred materials

Lifestyle

Pets

Children

Accessibility

Comments

---

# STEP 8

Uploads

Allow

PDF

DWG

DXF

SKP

GLB

Images

Videos

ZIP

Drag and Drop

Preview

Delete

Progress

Virus check

---

# STEP 9

Summary

Show

Project

Floors

Spaces

Options

Package

Uploads

Total

Estimated Delivery

Accept Terms

Generate Quote Preview

---

# STEP 10

Confirmation

Generate

Project Number

Confirmation Email

PDF Quote

Dashboard Link

---

# PHASE 5 - LIVE PRICE ENGINE

Realtime Calculation

Subtotal

+

Package

+

Extra Services

+

Taxes

=

Total

Must update instantly

No page refresh

---

# PHASE 6 - CUSTOMER DASHBOARD

Features

Projects

Messages

Invoices

Payments

Downloads

Timeline

Virtual Tours

Shopping Lists

Profile

Notifications

---

Project Details

Overview

Designer

Status

Progress

Files

Comments

Deliverables

Timeline

Payments

Invoices

---

# PHASE 7 - DESIGNER DASHBOARD

Assigned Projects

Calendar

Deadlines

Messages

Uploads

Deliverables

Revision Requests

Notes

Client Info

---

# PHASE 8 - ADMIN CRM

Kanban

New

Qualified

Quote Sent

Waiting Payment

Design

Revision

Delivered

Completed

Cancelled

Drag & Drop

Bulk Actions

Filters

Search

---

# PHASE 9 - COMMUNICATION

Internal Chat

Client

Designer

Admin

Features

Typing

Seen

Attachments

Notifications

Emoji

Message history

---

# PHASE 10 - FILE MANAGEMENT

Folder Structure

Project

Plans

Images

3D

Videos

Invoices

Contracts

Deliverables

Versioning

---

# PHASE 11 - DELIVERABLES

Designer uploads

Images

PDF

DWG

SKP

GLB

360 Tour

Videos

Client downloads

Approve

Reject

Comment

---

# PHASE 12 - PAYMENTS

Support

Stripe

PayPal

Local Payments

Manual Transfer

Milestones

30%

40%

30%

Invoices

Receipts

Refunds

---

# PHASE 13 - PDF GENERATION

Generate automatically

Quote

Invoice

Contract

Project Summary

Completion Certificate

---

# PHASE 14 - EMAILS

Templates

Project Submitted

Quote Ready

Payment Received

Designer Assigned

Revision Needed

Project Delivered

Thank You

---

# PHASE 15 - NOTIFICATIONS

Email

SMS

WhatsApp

In App

Push

---

# PHASE 16 - MARKETPLACE INTEGRATION

THIS IS THE BIGGEST DIFFERENTIATOR.

Every room should eventually generate

Recommended Furniture

Recommended Lighting

Recommended Decorations

Recommended Flooring

Recommended Wall Coverings

Recommended Paint

Recommended Curtains

Recommended Accessories

All linked to Loft Design products.

Shopping List

↓

Click Product

↓

Open Product Page

↓

Add to Cart

↓

Checkout

---

# PHASE 17 - AI FEATURES

Future

Analyze selected inspiration images

Detect

Modern

Japandi

Minimalist

Luxury

Generate Designer Brief

Estimate furniture budget

Suggest products

Auto generate moodboard

---

# PHASE 18 - VIRTUAL TOUR

After completion

Generate

360 Tour

Web Viewer

GLB Viewer

AR Viewer

---

# PHASE 19 - ANALYTICS

Dashboard

Revenue

Projects

Conversion Rate

Average Order

Popular Styles

Popular Spaces

Top Designers

Most Selected Products

---

# TESTING

Unit Tests

Integration Tests

Wizard Tests

Pricing Tests

Permissions

Uploads

Emails

Payments

Admin

Designer

Customer

---

# SECURITY

Permissions

Role Based Access

CSRF

Validation

Upload Security

Rate Limiting

Audit Logs

Encryption

---

# PERFORMANCE

Image Lazy Loading

CDN

Caching

Database Indexes

Queue Emails

Queue PDF

Queue Uploads

Queue Notifications

---

# FINAL ACCEPTANCE CHECKLIST

Customer can:

✅ Create project

✅ Add multiple floors

✅ Add multiple spaces

✅ View live pricing

✅ Select package

✅ Select extra services

✅ Choose inspiration images per room

✅ Upload plans/photos

✅ Submit request

✅ Receive PDF quote

✅ Pay online

✅ Track project

✅ Chat with designer

✅ Download final deliverables

✅ Access virtual tour

✅ Buy recommended products from marketplace

Admin can:

✅ Manage catalog

✅ Manage pricing

✅ Assign designers

✅ Track all projects

✅ Generate invoices

✅ Manage revisions

✅ Upload deliverables

Designer can:

✅ Receive assignments

✅ Chat with client

✅ Upload work

✅ Track revisions

✅ Deliver final project

Marketplace Integration:

✅ Every designed room produces a shopping list linked to Loft Design products.

END.