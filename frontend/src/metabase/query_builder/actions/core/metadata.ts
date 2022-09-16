import _ from "underscore";

import { loadMetadataForQueries } from "metabase/redux/metadata";
import { getMetadata } from "metabase/selectors/metadata";

import { Card } from "metabase-types/types/Card";
import { Dispatch, GetState } from "metabase-types/store";
import Question from "metabase-lib/lib/Question";

export interface LoadMetadataOptions {
  reload?: boolean;
}

export const loadMetadataForCard =
  (card: Card, options?: LoadMetadataOptions) =>
  (dispatch: Dispatch, getState: GetState) => {
    const metadata = getMetadata(getState());
    console.log("🚀", { metadata });
    const question = new Question(card, metadata);
    console.log("🚀", { question });
    const queries = [question.query()];
    console.log("🚀", { queries });
    if (question.isDataset()) {
      queries.push(question.composeDataset().query());
    }
    return dispatch(
      loadMetadataForQueries(queries, question.dependentMetadata(), options),
    );
  };
