import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { FC } from "react";
import { useState } from "react";

import Button from "./button";
import Combo from "./combox";
import OauthApi from "../services/workflow/oauthApi";
import { useRouter } from "next/router";

interface Channel {
  id: string;
  name: string;
}

const OauthIntegration: FC<{
  value: string | undefined;
  onChange: (value: string) => void;
}> = (props) => {
  const { data: session } = useSession();
  const api = OauthApi.fromSession(session);
  const router = useRouter();

  const defaultValue = props.value ? { id: props.value, name: props.value } : undefined;
  const [selected, setSelected] = useState<Channel | undefined>(defaultValue);
  const { data, isError } = useQuery([undefined], async () => await api.get_info("slack"), {
    enabled: !!session,
    retry: false,
  });

  return (
    <div>
      {isError && (
        <Button
          onClick={async () => {
            const url = await api.install("slack", router.asPath);
            await router.push(url);
          }}
        >
          Connect Slack
        </Button>
      )}
      {data && (
        <Combo<Channel>
          items={data}
          label="Slack Channel"
          value={selected}
          valueMapper={(e) => e.name}
          onChange={(e) => {
            setSelected(e);
            props.onChange(e.id);
          }}
        />
      )}
    </div>
  );
};

export default OauthIntegration;
