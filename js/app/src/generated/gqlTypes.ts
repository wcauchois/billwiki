/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: pageDetails
// ====================================================

export interface pageDetails_page {
  id: string;
  name: string;
  content: string;
}

export interface pageDetails {
  page: pageDetails_page;
}

export interface pageDetailsVariables {
  name: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: pageTitleCompletionsList
// ====================================================

export interface pageTitleCompletionsList {
  pageTitleCompletions: string[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: pageHistoryDetails
// ====================================================

export interface pageHistoryDetails_page_history {
  id: string;
  commitId: string;
  message: string;
  date: any;
  diff: string;
}

export interface pageHistoryDetails_page {
  id: string;
  history: pageHistoryDetails_page_history[];
}

export interface pageHistoryDetails {
  page: pageHistoryDetails_page;
}

export interface pageHistoryDetailsVariables {
  name: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: search
// ====================================================

export interface search_search_nameField_highlights {
  start: number;
  end: number;
}

export interface search_search_nameField {
  /**
   * The full text of the field
   */
  text: string;
  /**
   * A matching fragment from the field
   */
  fragment: string;
  /**
   * A list of indices in `fragment` that should be highlighted to the user.
   */
  highlights: search_search_nameField_highlights[];
}

export interface search_search_contentField_highlights {
  start: number;
  end: number;
}

export interface search_search_contentField {
  /**
   * A matching fragment from the field
   */
  fragment: string;
  /**
   * A list of indices in `fragment` that should be highlighted to the user.
   */
  highlights: search_search_contentField_highlights[];
}

export interface search_search {
  nameField: search_search_nameField;
  contentField: search_search_contentField;
}

export interface search {
  search: search_search[];
}

export interface searchVariables {
  query: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updatePage
// ====================================================

export interface updatePage_update {
  id: string;
  name: string;
  content: string;
}

export interface updatePage {
  update: updatePage_update;
}

export interface updatePageVariables {
  input: PageInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: fileHistoryEntry
// ====================================================

export interface fileHistoryEntry {
  id: string;
  commitId: string;
  message: string;
  date: any;
  diff: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: searchResult
// ====================================================

export interface searchResult_nameField_highlights {
  start: number;
  end: number;
}

export interface searchResult_nameField {
  /**
   * The full text of the field
   */
  text: string;
  /**
   * A matching fragment from the field
   */
  fragment: string;
  /**
   * A list of indices in `fragment` that should be highlighted to the user.
   */
  highlights: searchResult_nameField_highlights[];
}

export interface searchResult_contentField_highlights {
  start: number;
  end: number;
}

export interface searchResult_contentField {
  /**
   * A matching fragment from the field
   */
  fragment: string;
  /**
   * A list of indices in `fragment` that should be highlighted to the user.
   */
  highlights: searchResult_contentField_highlights[];
}

export interface searchResult {
  nameField: searchResult_nameField;
  contentField: searchResult_contentField;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: searchResultField
// ====================================================

export interface searchResultField_highlights {
  start: number;
  end: number;
}

export interface searchResultField {
  /**
   * A matching fragment from the field
   */
  fragment: string;
  /**
   * A list of indices in `fragment` that should be highlighted to the user.
   */
  highlights: searchResultField_highlights[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: textHighlightRange
// ====================================================

export interface textHighlightRange {
  start: number;
  end: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: page
// ====================================================

export interface page {
  id: string;
  name: string;
  content: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface PageInput {
  name: string;
  content: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
