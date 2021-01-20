if [ ! -d "./pm" ]; then
  git clone https://github.com/cuitaocrazy/pm
fi

if [ ! "$HELM_ARGS" ]; then
  HELM_ARGS="upgrade pm -n pm -i --create-namespace ."
fi

cd pm/helm/pm
git pull
helm $HELM_ARGS