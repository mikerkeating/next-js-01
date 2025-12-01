import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "nextra-theme-docs";
import { notFound, unstable_rethrow } from "next/navigation";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

interface PageProps {
  params: { mdxPath?: string[] } | Promise<{ mdxPath?: string[] }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  try {
    const { metadata } = await importPage(params.mdxPath);
    return metadata;
  } catch (error) {
    unstable_rethrow(error);
    return {};
  }
}

export default async function Page(props: PageProps) {
  const params = await props.params;

  try {
    const result = await importPage(params.mdxPath);
    const { default: MDXContent, toc, metadata, ...rest } = result;
    if (!MDXContent) notFound();
    const { wrapper: Wrapper } = getMDXComponents();

    return (
      <Wrapper toc={toc} metadata={metadata} {...rest}>
        <MDXContent params={params} />
      </Wrapper>
    );
  } catch (error) {
    unstable_rethrow(error);
    notFound();
  }
}
