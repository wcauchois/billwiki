use chrono::{DateTime, NaiveDateTime, Utc};
use git2::*;
use juniper::GraphQLObject;
use std::fmt::Write;

pub struct FileHistoryIterator<'repo> {
    repository: &'repo Repository,
    filename: String,
    current_commit: Option<Box<Commit<'repo>>>,
}

impl<'repo> FileHistoryIterator<'repo> {
    pub fn new<T: ToString>(
        repository: &'repo Repository,
        filename: T,
    ) -> anyhow::Result<FileHistoryIterator<'repo>> {
        Ok(FileHistoryIterator {
            repository,
            filename: filename.to_string(),
            current_commit: Some(Box::new(repository.head()?.peel_to_commit()?)),
        })
    }

    pub fn collect_and_flatten(&mut self) -> Vec<FileHistoryEntry> {
        self.flatten().collect::<Vec<_>>()
    }
}

#[derive(Debug, GraphQLObject)]
pub struct FileHistoryEntry {
    pub id: String,
    pub commit_id: String,
    pub message: String,
    pub date: DateTime<Utc>,
    pub diff: String,
}

fn diff_to_string(diff: &Diff) -> String {
    let mut result = String::new();

    diff.print(DiffFormat::Patch, |_delta, _hunk, line| {
        match line.origin_value() {
            DiffLineType::Context | DiffLineType::Addition | DiffLineType::Deletion => {
                write!(result, "{}", line.origin()).unwrap()
            }
            _ => {}
        };
        write!(result, "{}", std::str::from_utf8(line.content()).unwrap()).unwrap();
        true
    })
    .unwrap();

    result
}

impl<'repo> Iterator for FileHistoryIterator<'repo> {
    /// Yields None if there was no history relevant to the file; you should
    /// flatten this iterator.
    type Item = Option<FileHistoryEntry>;

    fn next(&mut self) -> Option<Self::Item> {
        let current_commit = match &self.current_commit {
            Some(c) => *c.clone(),
            None => return None,
        };
        let parent_commit = current_commit.parents().next();
        let parent_tree = parent_commit.as_ref().map(|c| c.tree().unwrap());
        let current_tree = current_commit.tree().unwrap();
        let diff = self
            .repository
            .diff_tree_to_tree(
                parent_tree.as_ref(),
                Some(&current_tree),
                Some(DiffOptions::new().pathspec(&self.filename)),
            )
            .unwrap();

        // Advance the iterator
        self.current_commit = parent_commit.as_ref().map(|c| Box::new(c.clone()));

        let num_deltas = diff.deltas().count();
        if num_deltas == 0 {
            Some(None)
        } else {
            let commit_date = DateTime::<Utc>::from_utc(
                NaiveDateTime::from_timestamp(current_commit.time().seconds(), 0),
                Utc,
            );
            let diff_string = diff_to_string(&diff);
            let commit_id = current_commit.id().to_string();
            Some(Some(FileHistoryEntry {
                id: format!("{}/{}", self.filename, commit_id),
                commit_id,
                date: commit_date,
                diff: diff_string,
                message: current_commit.message().unwrap_or("").to_string(),
            }))
        }
    }
}
