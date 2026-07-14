"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "aaaaaaaa";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "ads_content_cms",
  title: "ADS 아델슨 콘텐츠 CMS",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("콘텐츠")
          .items([
            S.listItem()
              .title("대시보드 경고")
              .child(
                S.list()
                  .title("콘텐츠 점검")
                  .items([
                    S.listItem()
                      .title("시험조건·썸네일 누락 영상")
                      .child(
                        S.documentList()
                          .title("시험조건·썸네일 누락 영상")
                          .filter(
                            '_type == "testVideo" && active == true && (!defined(poster.asset) || !defined(product) || !defined(dimensions) || !defined(testAuthority))',
                          ),
                      ),
                    S.listItem()
                      .title("관련 시험성적서 없는 영상")
                      .child(
                        S.documentList()
                          .title("관련 시험성적서 없는 영상")
                          .filter(
                            '_type == "testVideo" && active == true && !defined(relatedReport)',
                          ),
                      ),
                    S.listItem()
                      .title("공개 중이지만 파일 없는 문서")
                      .child(
                        S.documentList()
                          .title("공개 파일 누락")
                          .filter(
                            '_type == "downloadDocument" && active == true && (!defined(file.asset) || !defined(thumbnail.asset))',
                          ),
                      ),
                    S.listItem()
                      .title("적용모델 없는 시험자료")
                      .child(
                        S.documentList()
                          .title("적용모델 누락")
                          .filter(
                            '_type == "testResult" && active == true && !defined(productModel)',
                          ),
                      ),
                  ]),
              ),
            S.divider(),
            S.documentTypeListItem("homePage").title("홈페이지"),
            S.documentTypeListItem("product").title("제품"),
            S.documentTypeListItem("testResult").title("성능 시험"),
            S.documentTypeListItem("testVideo").title("시험 영상"),
            S.documentTypeListItem("industry").title("적용 분야"),
            S.documentTypeListItem("caseStudy").title("적용 사례"),
            S.documentTypeListItem("downloadDocument").title("시험·인증 문서 / 카탈로그"),
            S.documentTypeListItem("companyGallery").title("회사·공장"),
            S.divider(),
            S.documentTypeListItem("siteSettings").title("사이트 설정"),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
});
