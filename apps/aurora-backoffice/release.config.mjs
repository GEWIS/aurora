export default {
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/github",
      {
        "successComment": false,
        "failComment": false,
        "failTitle": false,
        "labels": false,
        "releasedLabels": false
      }
    ]
  ]
}


