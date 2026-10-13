---
name: ZUGFeRD / Factur-X Muster
description: Browser-basierte Muster-Rechnung zum Testen von Invoice-Integrationen
colors:
  bg: "#f5f7fb"
  bg-strong: "#edf2fb"
  panel: "#ffffff"
  panel-soft: "#f8fafc"
  stroke: "#e2e8f0"
  stroke-strong: "#cbd5e1"
  text: "#172033"
  muted: "#5f6f87"
  brand: "#1f4ec7"
  brand-deep: "#173a7a"
  danger: "#b93f39"
  success: "#14804c"
  white: "#ffffff"
typography:
  display:
    fontFamily: '"Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(1.9rem, 2vw, 2.7rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.06em"
  body:
    fontFamily: '"Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: '"Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif'
    fontSize: "0.76rem"
    fontWeight: 600
    letterSpacing: "0.02em"
rounded:
  sm: "12px"
  md: "20px"
  lg: "24px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brand-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  button-secondary:
    backgroundColor: "#f4f7ff"
    textColor: "{colors.brand-deep}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    borderColor: "{colors.stroke}"
    rounded: "{rounded.sm}"
---

## Overview

This project uses a quiet enterprise-invoice interface: a light neutral background, strong sans-serif type, clearly separated form groups, and a restrained blue accent used to signal primary actions and high-value data. The interface is designed for precision and speed, not decoration.

## Colors

- Background: off-white neutral with minimal blue undertones for contrast and quiet structure.
- Panels: white surfaces with thin gray borders.
- Primary action: deep indigo-blue used sparingly for the main CTA.
- Text: near-black charcoal for primary reading with muted slate-gray for supporting labels and metadata.
- Error states: soft red backgrounds and red text to surface validation issues without visual noise.

## Typography

The interface uses a clean sans-serif stack with a confident, highly legible type rhythm. Headings are bold and compact; labels are small uppercase-like caps with clear spacing; body text remains neutral and spacious.

## Layout

The workspace is a two-column structure: a narrow summary sidebar on the left and a detailed invoice form on the right. Within the form, fields are organized in 2-column grids and collapse to a single column at smaller breakpoints. The table for invoice lines uses generous horizontal rhythm and consistent row spacing.

## Elevation & Depth

Depth is minimal and intentional. Surfaces rely on low-contrast borders and soft shadows rather than aggressive gradients or heavy overlays. The design avoids decorative layered effects; it emphasizes separation through spacing and tonal difference.

## Shapes

Rounded corners stay conservative, mainly in the 12px–20px range. Inputs, panels, and buttons use soft radii rather than sharp edges, helping preserve clarity without adding visual tension.

## Components

- Buttons: primary actions use a solid deep blue fill; secondary actions remain subtle and low-contrast.
- Form inputs: border-only fields with crisp focus rings for clarity and accessibility.
- Summary cards: compact rows with subtle dividing lines and a highlighted total row.
- Invoice table: bordered cells with consistent alignment and low visual clutter.

## Do's and Don'ts

Do:
- keep the interface minimal and data-forward;
- preserve crisp hierarchy between labels, fields, totals, and actions;
- use the brand blue only for deliberate emphasis.

Don't:
- add heavy gradients, glossy effects, or decorative illustration;
- overuse color beyond primary actions and validation states;
- introduce visual noise that competes with the invoice data itself.
