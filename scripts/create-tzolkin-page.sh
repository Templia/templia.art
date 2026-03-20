#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage:
  scripts/create-tzolkin-page.sh <check_in_yyyy-mm-dd> <check_out_yyyy-mm-dd>

Example:
  scripts/create-tzolkin-page.sh 2026-03-05 2026-03-08

This creates:
  /tzolkin/<check-in>-to-<check-out>/index.html
USAGE
}

if [ "$#" -ne 2 ]; then
  usage
  exit 1
fi

check_in="$1"
check_out="$2"

if ! date -j -f "%Y-%m-%d" "$check_in" "+%Y-%m-%d" >/dev/null 2>&1; then
  echo "Invalid check-in date: $check_in"
  exit 1
fi

if ! date -j -f "%Y-%m-%d" "$check_out" "+%Y-%m-%d" >/dev/null 2>&1; then
  echo "Invalid check-out date: $check_out"
  exit 1
fi

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
slug="$check_in-to-$check_out"
target_dir="$root_dir/tzolkin/$slug"
template_dir="$root_dir/tzolkin/2026-02-10-to-2026-02-12"

if [ -d "$target_dir" ]; then
  echo "Target already exists: $target_dir"
  exit 1
fi

if [ ! -f "$template_dir/index.html" ]; then
  echo "Template not found: $template_dir/index.html"
  exit 1
fi

range_title() {
  local start="$1"
  local end="$2"
  local start_month start_day start_year end_month end_day end_year
  start_month="$(date -j -f "%Y-%m-%d" "$start" "+%B")"
  start_day="$(date -j -f "%Y-%m-%d" "$start" "+%-d")"
  start_year="$(date -j -f "%Y-%m-%d" "$start" "+%Y")"
  end_month="$(date -j -f "%Y-%m-%d" "$end" "+%B")"
  end_day="$(date -j -f "%Y-%m-%d" "$end" "+%-d")"
  end_year="$(date -j -f "%Y-%m-%d" "$end" "+%Y")"

  if [ "$start_year" = "$end_year" ] && [ "$start_month" = "$end_month" ]; then
    printf "%s %s-%s, %s" "$start_month" "$start_day" "$end_day" "$start_year"
  elif [ "$start_year" = "$end_year" ]; then
    printf "%s %s - %s %s, %s" "$start_month" "$start_day" "$end_month" "$end_day" "$start_year"
  else
    printf "%s %s, %s - %s %s, %s" "$start_month" "$start_day" "$start_year" "$end_month" "$end_day" "$end_year"
  fi
}

human_day() {
  local d="$1"
  date -j -f "%Y-%m-%d" "$d" "+%B %-d, %Y"
}

day_2="$(date -j -v+1d -f "%Y-%m-%d" "$check_in" "+%Y-%m-%d")"

display_range="$(range_title "$check_in" "$check_out")"
display_day_1="$(human_day "$check_in")"
display_day_2="$(human_day "$day_2")"
display_day_3="$(human_day "$check_out")"

mkdir -p "$target_dir"
cp -R "$template_dir/images" "$target_dir/"
cp "$template_dir/index.html" "$target_dir/index.html"

sed -i '' "s|2026-02-10-to-2026-02-12|$slug|g" "$target_dir/index.html"
sed -i '' "s|February 10-12, 2026|$display_range|g" "$target_dir/index.html"
sed -i '' "s|Day 1 · February 10, 2026|Day 1 · $display_day_1|g" "$target_dir/index.html"
sed -i '' "s|Day 2 · February 11, 2026|Day 2 · $display_day_2|g" "$target_dir/index.html"
sed -i '' "s|Day 3 · February 12, 2026|Day 3 · $display_day_3|g" "$target_dir/index.html"
# Update ISO dates in JSON-LD schema
sed -i '' "s|\"startDate\": \"2026-02-10\"|\"startDate\": \"$check_in\"|g" "$target_dir/index.html"
sed -i '' "s|\"endDate\": \"2026-02-12\"|\"endDate\": \"$check_out\"|g" "$target_dir/index.html"

echo "Created: /tzolkin/$slug/"

# Add new page to sitemap.xml
sitemap="$root_dir/sitemap.xml"
if [ -f "$sitemap" ]; then
  new_entry="
  <url>
    <loc>https://templia.art/tzolkin/$slug/</loc>
    <lastmod>$check_in</lastmod>
    <changefreq>never</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"https://templia.art/tzolkin/$slug/\"/>
  </url>"
  # Insert before closing </urlset>
  sed -i '' "s|</urlset>|$new_entry
</urlset>|" "$sitemap"
  echo "Updated: sitemap.xml"
fi

echo "Next step: review the page content for Tzolkin day-sign correctness and adjust text as needed."
