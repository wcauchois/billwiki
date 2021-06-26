use git2::*;
use std::path::Path;
use anyhow::anyhow;

pub struct Store {
  repository: Repository,
}

#[derive(Debug)]
pub struct Page {
  pub name: String,
  pub content: String,
}

impl Store {
  pub fn new(path: &str) -> anyhow::Result<Store> {
    Ok(Store {
      repository: Repository::init(path)?
    })
  }

  fn tree_entry_to_page(&self, entry: TreeEntry) -> anyhow::Result<Page> {
    let object = entry.to_object(&self.repository)?;
    let blob = object.as_blob().ok_or(anyhow!("Expected blob"))?;
    let name = entry.name().ok_or(anyhow!("Missing name!"))?;
    let name_stem = Path::new(name).file_stem().and_then(|s| s.to_str()).ok_or(anyhow!("Failed to stem file path"))?;
    let content_utf8 = std::str::from_utf8(blob.content())?;
    Ok(Page {
      name: name_stem.into(),
      content: content_utf8.into()
    })
  }

  pub fn pages(&self) -> anyhow::Result<Vec<Page>> {
    let head_obj = self.repository.revparse_single("HEAD")?;
    let tree = head_obj.peel_to_tree()?;
    let pages = tree.iter().flat_map(|entry| {
      match self.tree_entry_to_page(entry) {
        Ok(page) => Some(page),
        Err(err) => {
          warn!("Error converting tree entry to page: {}", err);
          None
        },
      }
    }).collect::<Vec<Page>>();
    Ok(pages)
  }
}
