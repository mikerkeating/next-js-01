import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "nextra-theme-docs";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  return metadata;
}

interface PageProps {
  params: Promise<{ mdxPath?: string[] }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const result = await importPage(params.mdxPath);
  const { default: MDXContent, toc, metadata, ...rest } = result;
  const { wrapper: Wrapper } = getMDXComponents();

  return (
    <Wrapper toc={toc} metadata={metadata} {...rest}>
      <MDXContent params={params} />
    </Wrapper>
  );
}
