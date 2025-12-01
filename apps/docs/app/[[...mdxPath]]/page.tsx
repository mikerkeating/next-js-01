import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "nextra-theme-docs";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

interface PageProps {
  params: { mdxPath?: string[] } | Promise<{ mdxPath?: string[] }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  return metadata;
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
