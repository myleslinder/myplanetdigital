

// Create predefined groups of tiles, based on their tags
// window.tileTaggedGroups = {'careers': [TileDomEl1, TileDomEl2 ... ],  ... }
/*
Removed: The tags are now injected into the class of the tile.
window.tileTaggedGroups = {};
if('forEach' in []) {
  [].forEach.call(document.querySelectorAll('.tile'), function(tile) {
      tile.getAttribute('data-tags').split(/\s+/).forEach(function(usedTag) {
          window.tileTaggedGroups[usedTag] = window.tileTaggedGroups[usedTag] || [];
          window.tileTaggedGroups[usedTag].push(tile);
      });
  });
}
*/