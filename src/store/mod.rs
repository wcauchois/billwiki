use anyhow::anyhow;
use git2::*;
use std::path::Path;
use std::path::PathBuf;

pub struct Store {
    repository: Repository,
}

#[derive(Debug)]
pub struct Page {
    pub name: String,
    pub content: String,
}

impl Store {
    pub fn new(path: &PathBuf) -> anyhow::Result<Store> {
        Ok(Store {
            repository: Repository::init_bare(path)?,
        })
    }

    fn tree_entry_to_page(&self, entry: TreeEntry) -> anyhow::Result<Page> {
        let object = entry.to_object(&self.repository)?;
        let blob = object.as_blob().ok_or(anyhow!("Expected blob"))?;
        let name = entry.name().ok_or(anyhow!("Missing name!"))?;
        let name_stem = Path::new(name)
            .file_stem()
            .and_then(|s| s.to_str())
            .ok_or(anyhow!("Failed to stem file path"))?;
        let content_utf8 = std::str::from_utf8(blob.content())?;
        Ok(Page {
            name: name_stem.into(),
            content: content_utf8.into(),
        })
    }

    fn name_to_path(&self, name: &str) -> String {
        format!("{}.md", name)
    }

    pub fn update_page(&self, name: &str, content: &str) -> anyhow::Result<()> {
        let path = self.name_to_path(name);

        let head = self.repository.head()?;
        let head_commit = head.peel_to_commit()?;
        let head_tree = head.peel_to_tree()?;

        let blob_oid = self.repository.blob(content.as_bytes())?;
        let mut tree_builder = self.repository.treebuilder(Some(&head_tree))?;
        tree_builder.insert(path, blob_oid, 0o100644)?;
        let tree_oid = tree_builder.write()?;
        let new_tree = self.repository.find_tree(tree_oid)?;

        let sig = Signature::now("BillWiki", "billwiki@example.com")?;
        self.repository.commit(
            Some("HEAD"),
            &sig,
            &sig,
            format!("Update {}", name).as_str(),
            &new_tree,
            &[&head_commit],
        )?;

        Ok(())
    }

    pub fn get_page(&self, name: &str) -> anyhow::Result<Page> {
        let path = self.name_to_path(name);
        let head_tree = self.repository.head()?.peel_to_tree()?;
        let entry = head_tree.get_path(Path::new(&path))?;
        self.tree_entry_to_page(entry)
    }

    pub fn get_pages(&self) -> anyhow::Result<Vec<Page>> {
        let head_tree = self.repository.head()?.peel_to_tree()?;
        let pages = head_tree
            .iter()
            .flat_map(|entry| match self.tree_entry_to_page(entry) {
                Ok(page) => Some(page),
                Err(err) => {
                    warn!("Error converting tree entry to page: {}", err);
                    None
                }
            })
            .collect::<Vec<Page>>();
        Ok(pages)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Run with: cargo test temp_test -- --nocapture
    #[test]
    fn temp_test() {
        // FileHistory feature from libgit2sharp: https://github.com/libgit2/libgit2sharp/pull/963/files
        // https://stackoverflow.com/questions/8239580/how-to-retrieve-the-history-of-a-file
        let repository = Repository::init_bare("/Users/wcauchois/code/billwiki/devwiki").unwrap();
        let head = repository.head().unwrap();
        let head_tree = head.peel_to_tree().unwrap();
        let prior_head_commit = head.peel_to_commit().unwrap().parent(0).unwrap();
        let prior_head_tree = prior_head_commit.tree().unwrap();
        let diff = repository.diff_tree_to_tree(Some(&head_tree), Some(&prior_head_tree), None).unwrap();

        let mut diff_output = String::new();
        use std::fmt::Write;
        // diff example: https://libgit2.org/libgit2/ex/HEAD/diff.html
        // diff_output function: https://github.com/libgit2/libgit2/blob/f9c4dc10d90732cfbe2271dd58b01dd8f4003d15/examples/common.c#L56
        diff.print(DiffFormat::Patch, |delta, hunk, line| {
            match line.origin_value() {
                DiffLineType::Context | DiffLineType::Addition | DiffLineType::Deletion => write!(diff_output, "{}", line.origin()).unwrap(),
                _ => {}
            };
            write!(diff_output, "{}", std::str::from_utf8(line.content()).unwrap());
            // println!("{:?} {:?} {:?}", delta, hunk, line);
            true
        }).unwrap();
        println!("{}", diff_output);
        // println!("{:?}", diff.stats().unwrap());
    }
}
