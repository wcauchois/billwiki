use git2::Repository;

pub struct Store {
  repository: Repository,
}

impl Store {
  pub fn new(path: &str) -> anyhow::Result<Store> {
    Ok(Store {
      repository: Repository::init(path)?
    })
  }

  pub fn pages(&self) -> anyhow::Result<()> {
    let head_obj = self.repository.revparse_single("HEAD")?;
    let tree = head_obj.peel_to_tree()?;
    for entry in tree.iter() {
      if let Some(blob) = entry.to_object(&self.repository)?.as_blob() {
        let name = entry.name();
        println!("content: {:?}", std::str::from_utf8(blob.content())?);
      }
    }
    Ok(())
  }
}
